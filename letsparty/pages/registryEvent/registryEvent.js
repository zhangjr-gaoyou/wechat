// miniprogram/pages/displayEvent/displayEvent.js

const util = require('../../common/utils.js')
const now = util.nowDateTime



const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    event: null,
    haveEvent: false,
    eventId: '',
    dispMap: false,
    host: '',
    nickName:'',
    realName: '',
    userCode: '',
    userPhone: '',
    userDept: '',
    latitude: 23.099994,
    longitude: 113.324520,
    markers: [{
      id: 1,
      latitude: 23.099994,
      longitude: 113.324520,
      name: '活动地点'
    }],
    enableScroll: false,
    showLocation: false,
    havError: false,
    errMesg: null,

  },


  nameBindBlur: function (e) {
    this.setData({
      realName: e.detail.value,
    })
  },

  phoneBindBlur: function (e) {
    this.setData({
      userPhone: e.detail.value,
    })
  },

  tapPlace: function () {
    this.setData({
      dispMap: !this.data.dispMap,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    var that = this;

    this.setData({
      eventId: options.eventId,
      host: options.host
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
            'markers[0].latitude': res.data.latitude,
            'markers[0].longitude': res.data.longitude



          });
          console.log('event:', that.data.event)
        }
      })

    

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  //onReady: function (e) {
  
  //},

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

  
  onQuit: function(){

    
      app.globalData.flag = true;
      wx.reLaunch({
        url: '../index/index',
      })
    
  },

  registrySubmit: function (e) {
    var that = this;

    if (that.data.realName == "") {
      that.setData({
        havError: true,
        errMesg: '必须输入你真实姓名！'

      })
      return;
    }
    
    if (that.data.userPhone == "") {
      that.setData({
        havError: true,
        errMesg: '必须留下手机以便于联系！'
      })
      return;
    }
    

    that.setData({
      nickName: e.detail.userInfo.nickName,
      userAvatar: e.detail.userInfo.avatarUrl,
      //realName: e.detail.value.realName,
      //userPhone: e.detail.value.userPhone,
    });

    if(that.data.nickName == ''){
      wx.showToast({
        title: 'nickName 为空！',
      });
    }
    
    const db = wx.cloud.database()
    
    db.collection('user-event').where({
      userName: that.data.nickName,
      eventId: that.data.eventId

    }).count({
      success: function (res) {
        console.log(res.total)
        if(res.total < 1){
          db.collection('user-event').add({
            data: {
              userName: that.data.nickName,
              userAvatar: that.data.userAvatar,
              eventId: that.data.eventId,
              userRole: "参与者",
              realName: that.data.realName,
              userPhone: that.data.userPhone,
              eventName: that.data.event.eventName,
              eventPlace: that.data.event.eventPlace,
              eventStatus: "已注册",
              startDate: that.data.event.startDate,
              startTime: that.data.event.startTime,
              endDate: that.data.event.endDate,
              endTime: that.data.event.endTime,
              eventDetails: that.data.event.eventDetails,
              opTime: now()

            },
            success: res => {
              // 在返回结果中会包含新创建的记录的 _id
              that.setData({
                regId: res._id,

              })
              wx.showToast({
                title: '注册成功',
              })
              console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
              wx.reLaunch({
                url: '../index/index',
              })
            },
            fail: err => {
              wx.showToast({
                icon: 'none',
                title: '注册失败'
              })
              console.error('[数据库] [新增记录] 失败：', err)
            }
          });

        }
        else{

          wx.showToast({
            duration: 3000,
            title: '你已注册该活动！'
          })
          wx.reLaunch({
            url: '../index/index',
          })
        }

      }
    })

    

    
  },
})