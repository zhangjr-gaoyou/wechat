//index.js

var base64 = require("../../images/base64");

const app = getApp()

Page({
  data: {
    // add
    canIUse: wx.canIUse('button.open-type.getUserInfo'),

    avatarUrl: './user-unlogin.png',
    nickName: '',
    userInfo: null,
    logged: false,
    events: null,
    haveEvent: false,
    authed: false,
  },

  onLoad: function () {

    var that = this;

    this.setData({
      icon20: base64.icon20,
      icon60: base64.icon60,
    });

    wx.showLoading({
      title: '加载中...',
    })

    //add
    // 查看是否授权
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          that.setData({
            authed: true
          });

          wx.getUserInfo({
            success: function (res) {

              console.log('res', res);
              app.globalData.userInfo = res.userInfo;

              that.setData({
                nickName: res.userInfo.nickName,
                userInfo: res.userInfo
              });

              console.log('userName', that.data.nickName);
              
              // 获取openid
              wx.cloud.callFunction({
                name: 'login',
                data: {},
                success: res => {
                  console.log('[云函数] [login] user openid: ', res.result.userInfo.openId)
                  app.globalData.openid = res.result.userInfo.openId

                },
                fail: err => {
                  console.error('[云函数] [login] 调用失败', err)
                }
              });



              var _userName = that.data.nickName;

            
              const db = wx.cloud.database()
              const _ = db.command
              db.collection('user-event').orderBy('startDate', 'desc')
                .where({
                  userName: _userName,
                  eventStatus: _.neq("结束"),
                })
                .get({
                  success: function (res) {
                    
                    if (res.data.length > 0) {
                      that.setData({
                        eventCount: res.data.length,
                        haveEvent: true,
                      });
                    }
                    that.setData({
                      events: res.data,
                    });

                    console.log('events', that.data.events)
                  }
                })

            }
          })
        }
        else {
          console.log("not auth");
        }
      }
    });

    wx.hideLoading();



  },



  onGetUserInfo: function (e) {
    var that = this;

    if (!this.logged && e.detail.userInfo) {
      that.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo,
        nickName: e.detail.userInfo.nickName
      })
      console.log(e);
      wx.getSetting({
        success: function (res) {
          if (res.authSetting['scope.userInfo']) {
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称
            that.setData({
              authed: true
            });

            wx.getUserInfo({
              success: function (res) {

                console.log('res', res);
                app.globalData.userInfo = res.userInfo;

                that.setData({
                  nickName: res.userInfo.nickName,
                  userInfo: res.userInfo
                });

                console.log('userName', that.data.nickName);


                var _userName = that.data.nickName;
                // 获取openid
                wx.cloud.callFunction({
                  name: 'login',
                  data: {},
                  success: res => {
                    console.log('[云函数] [login] user openid: ', res.result.userInfo.openId)
                    app.globalData.openid = res.result.userInfo.openId

                  },
                  fail: err => {
                    console.error('[云函数] [login] 调用失败', err)
                  }
                });

                wx.showLoading();

                const db = wx.cloud.database()
                const _ = db.command
                db.collection('user-event').orderBy('startDate', 'desc')
                  .where({
                    //userName: _userName,
                    openid: app.globalData.openid,
                    eventStatus: _.neq("结束"),
                  })
                  .get({
                    success: function (res) {
                      wx.hideLoading();
                      // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
                      console.log(res);


                      if (res.data.length > 0) {

                        that.setData({
                          haveEvent: true,
                        });


                      }
                      that.setData({
                        events: res.data,
                      });


                      console.log('events', that.data.events)
                    }
                  })

              }
            })
          }
          else {

            console.log("not auth");
          }
        }
      });
    }
  },

  bindGetUserInfo: function (e) {
    console.log(e.detail.userInfo)
  },

  onPullDownRefresh() {

    var that = this;
    wx.showToast({
      title: 'loading...',
      icon: 'loading'
    })
    //reload data
    that.setData({
      haveEvent: false,
    });
    const db = wx.cloud.database()
    const _ = db.command
    db.collection('user-event').orderBy('startDate', 'desc')
      .where({
        //userName: that.data.nickName,
        openid: app.globalData.openid,
        eventStatus: _.neq("结束"),
      })
      .get({
        success: function (res) {
          wx.hideLoading();
          // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条

          if (res.data.length > 0) {

            that.setData({
              eventCount: res.data.length,
              haveEvent: true,
            });


          }
          that.setData({
            events: res.data,
          });
          console.log('events', that.data.events)
        }
      });

      wx.stopPullDownRefresh({
        complete(res) {
          wx.hideToast()
          console.log(res, new Date())
        }
      }); 
    
    console.log('onPullDownRefresh', new Date())
  },

})
