// miniprogram/pages/displayEvent/displayEvent.js

const util = require('../../common/utils.js')
const now = util.nowDateTime

// 引入SDK核心类
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
var qqmapsdk;

const app = getApp();

var sliderWidth = 96;

const sourceType = [['camera'], ['album'], ['camera', 'album']]
const sizeType = [['compressed'], ['original'], ['compressed', 'original']]

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

    /* for navbar */
    tabs: ["概况", "相册", "通知"],
    activeIndex: 0,
    sliderOffset: 20,
    sliderLeft: 0,

    /* for notice */
    haveNotice: false,
    newNoticeMode: false,

    /* for images */
    imageList: [],
    sourceTypeIndex: 2,
    sourceType: ['拍照', '相册', '拍照或相册'],

    sizeTypeIndex: 0,
    sizeType: ['压缩', '原图', '压缩或原图'],

    imageCount: 9,

    haveUnsendImage: false,
    cloudImageCount: 0,

  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    var that = this;

    that.setData({
      eventId: options.eventId,
      userRole: options.userRole,
      host: app.globalData.userInfo.nickName,

    })

    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });

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

    wx.showLoading();
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'updateSignin',
      // 传递给云函数的参数
      data: {
        eventId: that.data.eventId,
        //userName: that.data.host,
        openid: app.globalData.openid,
      },
      success: res => {
        wx.hideLoading();
        wx.showToast({
          icon: 'success',
          title: '签到成功！',
          duration: 2000,
        })
        console.log(res)

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


  pubNoticeTap: function (e){
    
    var that = this;
    console.log('notice:', e.detail.value.noticeDetails);
    if (e.detail.value.noticeDetails == "") {

      wx.showToast({
        title: '通知内容为空！',
        duration: 2000,
      })
      return
    }

    const db = wx.cloud.database()

    // add event
    db.collection('event-notice').add({
      data: {
        userName: app.globalData.userInfo.nickName,
        openid: app.globalData.openid,
        eventId: that.data.eventId,
        opTime: now(),
        noticeDetails: e.detail.value.noticeDetails,
      },
      success: res => {
        var notice={};
        notice.userName = app.globalData.userInfo.nickName;

        notice.openid = app.globalData.openid;
        notice.eventId = that.data.eventId;
        notice.opTime = now();
        notice.noticeDetails = e.detail.value.noticeDetails;

        console.log("push notice", notice);

        this.data.eventNotices.push(notice);
        that.setData({
          eventNotices: this.data.eventNotices,
          newNoticeMode: false,

        })

        wx.showToast({
          icon: 'success',
          title: '创建通知成功',
          duration: 3000
        })
        console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
        
        

      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '创建通知失败',
          duration: 3000
        })
        console.error('[数据库] [创建通知] 失败：', err)
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

  },

  // navtab
  tabClick: function (e) {

    var that = this;

    that.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
    console.log('current tab:', that.data.activeIndex);

    const db = wx.cloud.database()
    const _ = db.command

    switch (e.currentTarget.id){
      case '0':
        
        var tmp=[]

        that.setData({
          imageList: tmp,
        });

        break;
      case '1':
        wx.showLoading();
        console.log('query images:', that.data.eventId);
        db.collection('event-image').orderBy('opTime', 'asc')
          .where({
            eventId: that.data.eventId,
          })
          .get({
            success: function (res) {
              
              // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
              console.log(res.data)
              that.setData({
                imageRecords: res.data,
              });

              var fileList=[]

              for (var j = 0, len = that.data.imageRecords.length; j < len; j++){
                
                fileList.push(that.data.imageRecords[j].fileId);
                
              }
              console.log(fileList)

              
              wx.cloud.getTempFileURL({
                fileList: fileList,
                success: res => {
                  // get temp file URL

                  console.log('Url files:',res.fileList)

                  for (var j = 0, len = res.fileList.length; j < len; j++)                           
                  {
                    that.data.imageList.push(res.fileList[j].tempFileURL);

                  }

                  that.setData({
                    fileList: fileList,
                    imageList: that.data.imageList,
                    cloudImageCount: that.data.imageList.length,
                  });

                  console.log('imageList',that.data.imageList)

                },
                fail: err => {
                  // handle error
                }
              })
              wx.hideLoading();

            },
            fail: function (err) {
              wx.hideLoading();
              console.log(err);
            },

          })
        break;
      case '2':

        var tmp = []

        that.setData({
          imageList: tmp,
        });

        wx.showLoading();
        console.log('query notices:', that.data.eventId);
     
        db.collection('event-notice').orderBy('opTime', 'asc')
          .where({
            eventId: that.data.eventId,
          })
          .get({
            success: function (res) {
              wx.hideLoading();
              // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条

              if (res.data.length > 0) {

                that.setData({
                  noticeCount: res.data.length,
                  haveNotice: true,
                });


              }
              that.setData({
                eventNotices: res.data,
              });


              console.log('notices', that.data.eventNotices)
            },
            fail: function (err) {
              wx.hideLoading();
              console.log(err);
            },

          })
          break;

      default:  
        break;

    
    }
    
  },

  createNotice: function () {
    var that=this;
    that.setData({
      
      newNoticeMode: true,

    })

  },


  chooseImage() {
    const that = this

    let imgcnt = this.data.imageCount - this.data.cloudImageCount
    console.log(imgcnt)

    if(imgcnt == 0){

      return;
    }

    wx.chooseImage({
      sourceType: sourceType[this.data.sourceTypeIndex],
      sizeType: sizeType[this.data.sizeTypeIndex],
      count: imgcnt,
      success(res) {
        console.log(res)
        
        // 去除重复图像
        var tmpFPs=[];
        var dupFlag=false;
        for (var j = 0, len1 = res.tempFilePaths.length; j < len1; j++) {
          dupFlag = false;
          for (var i = 0, len2 = that.data.imageList.length; i< len2; i++){
            console.log('compare:', 
               res.tempFilePaths[j].substr(res.tempFilePaths[j].lastIndexOf('/') + 1), 
               that.data.imageList[i].substr(that.data.imageList[i].lastIndexOf('/') + 1))
            if ( res.tempFilePaths[j].substr(res.tempFilePaths[j].lastIndexOf('/') + 1) == that.data.imageList[i].substr(that.data.imageList[i].lastIndexOf('/') + 1)){
              dupFlag = true;
              wx.showToast({
                title: '重复图片，已忽略！',
                duration: 2000,
              })
               break;

            }

          }

          if(!dupFlag){
            tmpFPs.push(res.tempFilePaths[j]);
          }

        }  

        //var newImageList = that.data.imageList.concat(res.tempFilePaths);

        var newImageList = that.data.imageList.concat(tmpFPs);


        that.setData({
          imageList: newImageList,
          
        })
        if (res.tempFilePaths.length>0){

          that.setData({
            haveUnsendImage: true,

          })
        }
      }
    })
  },
  previewImage(e) {
    const current = e.target.dataset.src

    console.log('current',current);
    wx.previewImage({
      current,
      urls: this.data.imageList
    })
  },

  longpressImage(e) {
    
    var that = this;
    const current = e.target.dataset.src

    console.log('longpress current', e.currentTarget);

    console.log('fileList',that.data.fileList);
    console.log('imageList', that.data.imageList);

    let delFile=[];
    delFile.push(that.data.fileList[e.currentTarget.id]);

    wx.showModal({
      title: '删除图片',
      content: '确认删除此张图片，删除的图片不再显示！',
      confirmColor: '#DC143C',
      confirmText: '确定',
      cancelText: '取消',
      success: function (res) {
        console.log(res);
        if (res.confirm) {
          wx.showLoading();
          // delete cloud disk
          wx.cloud.deleteFile({
            fileList: delFile,
            success: res => {
              // handle success
              console.log('delete file:',res.fileList)
            },
            fail: err => {
              // handle error
              console.log(err);
              return
            }
          })

          // delete record

         
          wx.cloud.callFunction({
            // 要调用的云函数名称
            name: 'removeImage',
            // 传递给云函数的参数
            data: {
              fileId: that.data.fileList[e.currentTarget.id],
            },
            success: res => {
              wx.hideLoading();
              wx.showToast({
                icon: 'success',
                title: '成功删除图片！',
              })
              console.log(res)

            },
            fail: err => {
              wx.hideLoading();
              wx.showToast({
                icon: 'none',
                title: '删除图片失败！',
              })
              console.error('[云函数] [removeImage] 调用失败：', err);
              return
            }
          })

          //

          that.data.fileList.splice(e.currentTarget.id,1);
          that.data.imageList.splice(e.currentTarget.id, 1);

          that.setData({
            fileList: that.data.fileList,
            imageList: that.data.imageList,
          });

          if (e.currentTarget.id < that.data.cloudImageCount){

            that.data.cloudImageCount = that.data.cloudImageCount-1;

            that.setData({
              cloudImageCount: that.data.cloudImageCount,
            });
          }
          
         
          if (that.data.cloudImageCount == that.data.imageList.length){
            that.setData({
              haveUnsendImage: false,

            })
          }

          wx.hideLoading();
        }

      },
      fail: function (res) {
        console.log(res);
      },
      complete: function (res) {
        console.log(res);
      }
    })
    
  
  },
  uploadImages: function (e) {
    
    var that = this;

    console.log('upload images', that.data.imageList);
    console.log('image count', that.data.cloudImageCount);
    var startIdx = that.data.cloudImageCount;

    for (var j = startIdx, len = that.data.imageList.length; j < len; j++) {
      console.log(that.data.imageList[j]);
      let fileName = that.data.imageList[j].substr(that.data.imageList[j].lastIndexOf('/') + 1); 

       console.log(fileName)

      wx.cloud.uploadFile({
        cloudPath: that.data.eventId+'/'+fileName, // 上传至云端的路径
        filePath: that.data.imageList[j], // 小程序临时文件路径
        success: res => {
          // 返回文件 ID
          console.log(res);

          
          // add record
          const db = wx.cloud.database()

          db.collection('event-image').add({
            data: {
              userName: app.globalData.userInfo.nickName,
              openid: app.globalData.openid,
              eventId: that.data.eventId,
              opTime: now(),
              fileId: res.fileID,
            },
            success: res => {

              that.data.fileList.push(res.fileID);

              that.setData({
                cloudImageCount: that.data.imageList.length,
                fileList: that.data.fileList,
                haveUnsendImage: false,

              })
              

              wx.showToast({
                icon: 'success',
                title: '图片上传成功！',
                duration: 3000
              })
              console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
            },
            fail: err => {
              wx.showToast({
                icon: 'none',
                title: '图片上传失败',
                duration: 3000
              })
              console.error('[数据库] [创建通知] 失败：', err)
            }
          })
        },
        fail: err => {
          console.log(err);
        }
      })
    }

  },

})