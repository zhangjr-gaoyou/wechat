

const util = require('../../common/utils.js')
const now = util.nowDateTime

// 引入SDK核心类
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
var qqmapsdk;

const app = getApp();

const db = wx.cloud.database();


var timer;
var markerNo = 0;


Page({

  /**
   * 页面的初始数据
   */
  data: {
    event: null,
    haveEvent: false,
    eventId: '',
    hostName: '',
    host: '',
    latitude: null,
    longitude: null,
    markers: [{
      id: 1,
      latitude: null,
      longitude: null,
      name: '活动地点'
    }],

    polyline: [{
      points: [],
      color: '#e64340AA',
      dottedLine: true,
      arrowLine: true,
      width: 4,

    }],
    enableScroll: true,
    showLocation: true,
    
    hasLocation: false,
    currLongitude: null,
    currLatitude: null,
    exitFlag: 0,
    distance: 0,

    traceFlag: false,
    traceId:0,

    disableTrace: true,
  

  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    var that = this;
    console.log('options->',options)

    that.setData({
      eventId: options.eventId,
      guestName: options.guestName,
      guestId: options.guestId,
      hostName: app.globalData.userInfo.nickName,
    })

   
    const db = wx.cloud.database()
    db.collection('event').doc(this.data.eventId)
      .get({
        success: function (res) {
          // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
          console.log(res.data);

          that.setData({
            haveEvent: true,
            event: res.data,
            'markers[0].id': 1,
            'markers[0].latitude': res.data.latitude,
            'markers[0].longitude': res.data.longitude,
            latitude: res.data.latitude,
            longitude: res.data.longitude,
          });


          console.log('event:', that.data.event);

        }
      });

    // add trace
    db.collection('user-trace').add({
      data: {
        openId: that.data.guestId,
        status: 0,
        longitude: 0.0,
        latitude: 0.0,
        opTime: now(),
      },
      success: function (res) {
        that.setData({
          traceId: res._id,
        });

        console.log(res)

      },
      fail: function (err) {
        console.log(err);
      }
    });

      // 实例化API核心类
      qqmapsdk = new QQMapWX({
        key: 'LAQBZ-TJ3RU-I2ZVQ-4Y7VF-PALIF-APB2R'
      });
    },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */

  /*
  onReady: function (e) {
  },
  */

  /**
   * 生命周期函数--监听页面显示
   */

  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },



  // 开始跟踪
  traceBeginTap: function () {

    var that = this;

    this.loopCheck();

    that.setData({

      traceFlag: true,
      traceStatus: '等待'+that.data.guestName +'同意跟踪！',

    })

    
    console.log('opTime:',that.data.opTime);

    
    
    
    



  },


  // 终止跟踪
  traceEndTap: function () {

    var that = this;

    that.setData({

      traceFlag: false,

    })

  
    clearInterval(timer);



  },


  loopCheck:function () {
    var that = this;

    timer = setTimeout(function () {
      console.log("----trace check----");
      db.collection('user-trace').doc(that.data.traceId)
        .get({
          success: function (res) {
            console.log(res.data);
            
            switch(res.data.status){
              case 0:
                
                break;
              case 1:
                that.setData({
                  traceStatus: that.data.guestName + '已同意上报'
                })
                break;
              case 2:
                that.setData({
                  traceStatus: that.data.guestName + '上报位置中'
                })

                var marker = {};
                marker.latitude = res.data.latitude;
                marker.longitude = res.data.longitude;

                if (markerNo + 1 > 20)
                  that.data.polyline[0].points.shift();

                that.data.polyline[0].points.push(marker);


                that.setData({

                  //latitude: res.latitude,
                  //longitude: res.longitude,
                  'markers[1].id': 2,
                  'markers[1].latitude': res.data.latitude,
                  'markers[1].longitude': res.data.longitude,

                  'polyline[0].points': that.data.polyline[0].points,
                });


                break;
              case 3:
                that.setData({
                  traceStatus: that.data.guestName + '停止上报位置'
                })
                break;
              default:
                break;        
            }


          },
          fail: err => {
            console.log(err);
          }
        });


      that.setData({
        opTime: now(),
      });

      markerNo = markerNo + 1

      that.loopCheck();
    }, 10000);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {

    var that=this;

    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }

    that.setData({
      disableTrace: false,
    })
  
    

    var url = 'pages/reportLocation/reportLocation?' +
      'eventId=' + this.data.eventId +
      '&hostName=' + this.data.hostName +
      '&guestId=' + this.data.guestId +
      '&traceId=' + that.data.traceId;
    console.log('share url->', url);

    return {
      title: '跟踪申请',
      path: url,
      success: function (res) {
        // 转发成功
        wx.showToast({
          icon: 'success',
          title: '转发成功'
        })
      },
      fail: function (res) {
        // 转发失败
        wx.showToast({
          icon: 'none',
          title: '转发失败'
        })
      }
    }

  },

})