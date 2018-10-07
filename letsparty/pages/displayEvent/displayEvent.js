// miniprogram/pages/displayEvent/displayEvent.js

const util = require('../../common/utils.js')
const now = util.nowDateTime

// 引入SDK核心类
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
var qqmapsdk;

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    event: null,
    haveEvent: false,
    eventId: '',
    userRole: '',
    host: '',
    latitude: null,
    longitude: null,
    markers: [{
      id: 1,
      latitude: null,
      longitude: null,
      name: '活动地点'
    }],

    enableScroll: false,
    showLocation: false,
    hasLocation: false,
    currLongitude: null,
    currLatitude: null,
    exitFlag: 0,
    distance: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    var that = this;

    this.setData({
      eventId: options.eventId,
      userRole: options.userRole,
      host: app.globalData.userInfo.nickName,

    })


    const db = wx.cloud.database()
    db.collection('event').doc(this.data.eventId)
      .get({
        success: function(res) {
          // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
          console.log(res.data);

          that.setData({
            haveEvent: true,
            event: res.data,
            'markers[0].latitude': res.data.latitude,
            'markers[0].longitude': res.data.longitude,
            latitude: res.data.latitude,
            longitude: res.data.longitude,
          });


          console.log('event:', that.data.event);

          //获取当前位置经纬度

          wx.getLocation({
            success: function (res1) {
              console.log(res1);

              that.setData({
                hasLocation: true,
                currLongitude: res1.longitude,
                currLatitude: res1.latitude,
              });

              console.log(that.data.longitude, that.data.latitude);
              console.log(that.data.currLongitude, that.data.currLatitude);

              qqmapsdk.calculateDistance({
                from: {
                  latitude: that.data.currLatitude,
                  longitude: that.data.currLongitude,
                },
                to: [{
                  latitude: that.data.latitude,
                  longitude: that.data.longitude
                }],

                success: function (res2) {
                  console.log(res2);
                  if (res2.status == 0) {

                    that.setData({

                      distance: res2.result.elements[0].distance,

                    });


                  } else {

                    that.setData({
                      exitFlag: 1,
                    });


                  }
                },

                fail: function (res2) {
                  that.setData({
                    exitFlag: 2,
                  });
                  console.log(res2);
                },
                complete: function (res2) {
                  console.log(res2);
                }
              });

            },

            fail: function (err) {
              wx.showModal({
                content: '不能获取当前位置信息，请检查是否关闭定位功能，然后重试！',
                showCancel: false,
                success: function (res) {

                  if (res.confirm) {
                    console.log('用户点击确定');
                  }
                }
              });

            }

          });
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

  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },




  // 成员签到
  eventSigninTap: function() {

    var that = this;

    // 判断距离是否在附近

   
    console.log(that.data.longitude, that.data.latitude);
    console.log(that.data.currLongitude, that.data.currLatitude);
    console.log('exitFlag=', that.data.exitFlag);
    if (that.data.exitFlag > 0) {

      wx.showModal({
        content: '不能计算你的位置和活动地点的距离，请退出页面重试！',
        showCancel: false,
        success: function(res4) {
          if (res4.confirm) {
            console.log('用户点击确定');
            wx.redirectTo({
              url: '../index/index'
            });
          }
        }
      });
      return;
    }

    if (that.data.distance > 2000) {
      wx.showModal({
        content: '你的位置和活动地点的距离' + that.data.distance + '米,大于2000米，不能注册，请到达活动地点再注册',
        showCancel: false,
        success: function(res3) {
          if (res3.confirm) {
            console.log('用户点击确定');
            wx.redirectTo({
              url: '../index/index'
            });

          }
        }
      });
      return;
    }
    /*
    qqmapsdk.calculateDistance({
      from: {
        latitude: that.data.currLatitude,
        longitude: that.data.currLongitude,
      },
      to: [{
        latitude: that.data.latitude,
        longitude: that.data.longitude
      }],

      success: function (res2) {
        console.log(res2);
        if (res2.status == 0) {
          if (res2.result.elements[0].distance > 1000) {

            errCode = 1;
            
            wx.showModal({
              content: '你的位置和活动地点的距离' + res2.result.elements[0].distance+'米,大于1000米，不能注册，请到达活动地点再注册',
              showCancel: false,
              success: function (res3) {
                if (res3.confirm) {
                  console.log('用户点击确定');
                }
              }
            }); 
            

            console.log("exitFlag1:", app.globalData.exitFlag);

          }

        }
        else {

          errCode = 2;
          
          wx.showModal({
            content: '不能计算你的位置和活动地点的距离，请稍后重试！',
            showCancel: false,
            success: function (res4) {                  
              if (res4.confirm) {
                console.log('用户点击确定')
              }
            }
          }); 
          


        }
      },

      fail: function (res2) {
        console.log(res2);
      },
      complete: function (res2) {
        console.log('complete', res2);
      }
    });

    
    console.log("exitFlag3:", app.globalData.exitFlag);
    */

    wx.showLoading();
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'updateSignin',
      // 传递给云函数的参数
      data: {
        eventId: that.data.eventId,
        userName: that.data.host,
      },
      success: res => {
        wx.hideLoading();
        wx.showToast({
          icon: 'success',
          title: '签到成功！',
          duration: 2000,
        })
        console.log(res)
        //wx.redirectTo({
        //  url: '../index/index'
        //})

      },
      fail: err => {
        wx.hideLoading();
        wx.showToast({
          icon: 'none',
          title: '签到失败，请稍后重试！',
          duration: 3000,
        })
        console.error('[云函数] [update] 调用失败：', err)
      }
    })


  },

  // 结束活动
  eventCloseTap() {
    var that = this;

    wx.showModal({
      title: '活动结束',
      content: '确认本次活动已结束，结束后的活动将删除，不再显示！',
      confirmColor: '#DC143C',
      confirmText: '确定',
      cancelText: '取消',
      success: function(res) {
        console.log(res);
        if (res.confirm) {
          wx.showLoading();
          wx.cloud.callFunction({
            // 要调用的云函数名称
            name: 'update',
            // 传递给云函数的参数
            data: {
              eventId: that.data.eventId,
              opTime: now(),
            },
            success: res => {
              wx.hideLoading();
              wx.showToast({
                icon: 'success',
                title: '调用成功',
              })
              console.log(res)

            },
            fail: err => {
              wx.hideLoading();
              wx.showToast({
                icon: 'none',
                title: '调用失败',
              })
              console.error('[云函数] [update] 调用失败：', err)
            }
          })
        }



        wx.redirectTo({
          url: '../index/index'
        })

      },
      fail: function(res) {
        console.log(res);
      },
      complete: function(res) {
        console.log(res);
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(res) {

    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }

    var url = 'pages/registryEvent/registryEvent?eventId=' + this.data.eventId +
      '&host=' + this.data.host;
    return {
      title: '活动邀请',
      path: url,
      success: function(res) {
        // 转发成功
        wx.showToast({
          icon: 'none',
          title: '转发成功'
        })
      },
      fail: function(res) {
        // 转发失败
        wx.showToast({
          icon: 'none',
          title: '转发失败'
        })
      }
    }

  }
})