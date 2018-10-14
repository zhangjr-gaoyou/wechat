// letsparty/pages/reportLocation/reportLocation.js

const util = require('../../common/utils.js')
const now = util.nowDateTime
const app = getApp()

const db = wx.cloud.database()
var timer;

var markerNo=0;

Page({

  /**
   * 页面的初始数据
   */
  data: {

    reportFlag: false,

    latitude: 23.099994,
    longitude: 113.324520,
    markers: [{
      id: 1,
      latitude: 23.099994,
      longitude: 113.324520,
      name: '活动点'
    }],

    polyline:[{
      points: [],
      color:'#e64340AA',
      dottedLine: true,
      arrowLine: true,
      width: 4,

    }],
    enableScroll: true,
    showLocation: true,

    traceFlag: true,

    disableReport: false,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    var that = this;

    that.setData({
      eventId: options.eventId,
      guestId: options.guestId,
      hostName: options.hostName,
      traceId: options.traceId,
    })

    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        console.log('位置信息',res);
        that.setData({

          latitude: res.latitude,
          longitude: res.longitude,
          'markers[0].id': 1,
          'markers[0].latitude': res.latitude,
          'markers[0].longitude': res.longitude,
         
        });

        that.setData({
          traceStatus: '位置:' + res.latitude + ' ' + res.longitude,
        })

      },
      fail: function (err) {
        console.log(err);
        that.setData({
          traceStatus: 'err:' + err,
        })
      },
    });

    /* 获取event 信息 */

  
    db.collection('event').doc(this.data.eventId)
      .get({
        success: function (res) {
          // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
          console.log(res.data);

          that.setData({
            event: res.data,
            //latitude: res.data.latitude,
            //longitude: res.data.longitude,
            'markers[1].id': 2,
            'markers[1].latitude': res.data.latitude,
            'markers[1].longitude': res.data.longitude,
            


         });
          console.log('event:', that.data.event)
        }
    })


    
  
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

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

  onQuit: function () {
    app.globalData.flag = true;
    wx.reLaunch({
      url: '../index/index',
    })
  },

  agreeSubmit: function(){

    var that = this;

    that.setData({
      reportFlag: true,
      disableReport: true,
    });

    that.setData({

      traceStatus: 'traceId:'+ that.data.traceId,

    })

    console.log('traceId:', that.data.traceId)
    
    //从服务端调用

    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'updateLocationRpt',
      // 传递给云函数的参数
      data: {
        traceId: that.data.traceId,
        now: now(),
      },
      success: res => {
        wx.showToast({
          icon: 'success',
          title: '同意跟踪活动！',
        })
        console.log(res)

      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '同意跟踪失败！',
        })
        console.error('[云函数] [update] 调用失败：', err)
      }
    })



    this.loopReport();
    
    
  },


 

  loopReport: function () {
    var that = this;
    timer = setTimeout(function () {
      console.log("----report data----");
      
      //获取定位
      wx.getLocation({
          //data: {
          //  type:'gcj02',
          //},
          type: 'gcj02',
          success: function(res) {
            console.log(res);
           

            var marker ={};
            marker.latitude = res.latitude;
            marker.longitude = res.longitude;

            if (markerNo+1 > 20)
              that.data.polyline[0].points.shift();

            that.data.polyline[0].points.push(marker);
            

            that.setData({
              
              //latitude: res.latitude,
              //longitude: res.longitude,

              'polyline[0].points' : that.data.polyline[0].points,
            });

            that.setData({

              traceStatus: '位置:' + res.latitude + ' ' + res.longitude,

            })

            console.log('polyline:',that.data.polyline);

            
            wx.cloud.callFunction({
              // 要调用的云函数名称
              name: 'updateLocationData',
              // 传递给云函数的参数
              data: {
                traceId: that.data.traceId,
                latitude: res.latitude,
                longitude: res.longitude,
                now: now(),
              },
              success: res => {
                
                console.log(res)

              },
              fail: err => {
                
                console.error('[云函数] [updateData] 调用失败：', err)
              }
            }) 

          },
          fail: function(err){
            console.log(err);
            that.setData({

              traceStatus: 'err:' + err,

            })
          },
        }
      );
      
      markerNo = markerNo+1
      that.loopReport();
    }, 10000);


  },

  quitReport: function(){

    var that = this;

    clearInterval(timer);

    that.setData({
      reportFlag: false,
      disableReport: false,
      traceStatus: '退出上报！'

    });

    db.collection('user-trace').doc(that.data.traceId)
      .update({
        data: {
          status: 3,
          opTime: now(),
        },
        success: console.log,
        fail: console.error
      })


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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  
  


})