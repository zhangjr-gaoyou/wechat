
const util = require('../../common/utils.js')
const now = util.nowDateTime

const app = getApp()

Page({
  data: {
    focus: true,
    startDate: "2016-09-01",
    endDate: "2016-09-01",
    startTime: "09:00",
    endTime: "18:00",
    userInfo: {},
    hasLocation: false,
    havError: false,
    errMesg: null,
    locationName: ''
  },

  onLoad: function () {
  
    var that = this;


    var today = new Date();

    var tomon = today.getMonth() + 1;
    var tomonStr=tomon;
    if(tomon<10)
      tomonStr='0'+tomon;
    var todd = today.getDate();
    var toddStr = todd;
    if(todd<10)
       toddStr = '0'+todd;       
    var todayStr = today.getFullYear() + '-'
                   +tomonStr + '-'
                   +toddStr;


    that.setData({
      userInfo: app.globalData.userInfo,
      startDate: todayStr,
      endDate: todayStr
    })

    console.log(that.data.startDate,that.data.endDate);
    //console.log('openid=',app.globalData.openid);
  },


  onShareAppMessage() {
    return {
      title: '使用原生地图选择位置',
      path: '/pages/createEvent/createEvent'
    }
  },

  
  chooseLocation() {
    var that = this;
    wx.chooseLocation({
      success(res) {
        console.log(res)
        that.setData({
          hasLocation: true,
          longitude: res.longitude, 
          latitude: res.latitude,
          locationAddress: res.address,
          locationName: res.name
        })
      }
    })
  },

  clearLocation() {
    this.setData({
      hasLocation: false
    })
  },

  bindNameChange: function (e) {
    this.setData({
      havError: false,
    })
  },

  bindStartDateChange: function (e) {

    var that = this;

    this.setData({
      startDate: e.detail.value,
    })

    if(this.data.startDate > this.data.endDate){

      that.setData({
        endDate: e.detail.value,
      })

    }
  },

  bindStartTimeChange: function (e) {

    var that = this;

    this.setData({
      startTime: e.detail.value,
    })

   
  },

  bindEndDateChange: function (e) {
    this.setData({
      endDate: e.detail.value
    })
  },

  bindEndTimeChange: function (e) {
    this.setData({
      endTime: e.detail.value
    })
  },

  formSubmit: function (e) {
    var that = this;
    console.log('form发生了submit事件，携带数据为：', e.detail.value)

    if(e.detail.value.eventName == ""){
      that.setData({
        havError: true,
        errMesg: '必须输入活动名称！'

      })
      return;
    }
    console.log('that.data:',that.data.locationName);

    if (this.data.locationName == "") {
      that.setData({
        havError: true,
        errMesg: '必须选择活动地点！'
      })
      return;
    }

  
    const db = wx.cloud.database()
    // add event
    db.collection('event').add({
      data: {
        userName: app.globalData.userInfo.nickName,
        userAvatar: app.globalData.userInfo.avatarUrl,
        eventName: e.detail.value.eventName,
        //eventPlace: e.detail.value.eventPlace,
        eventAddress: that.data.locationAddress,
        eventPlace: that.data.locationName,
        eventStatus: "开放",
        longitude: that.data.longitude,
        latitude: that.data.latitude,
        startDate: e.detail.value.startDate,
        startTime: e.detail.value.startTime,
        endDate: e.detail.value.endDate,
        endTime: e.detail.value.endTime,
        opTime: now(),
        eventDetails: e.detail.value.eventDetails,
        openid: app.globalData.openid
      },
      success: res => {
        // 在返回结果中会包含新创建的记录的 _id
        that.setData({
          eventId: res._id,

        })
        
        console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
       
        //add user-event
        db.collection('user-event').add({
          data: {
            userName: app.globalData.userInfo.nickName,
            userAvatar: app.globalData.userInfo.avatarUrl,
            userRole: "组织者",
            eventName: e.detail.value.eventName,
            eventId: that.data.eventId,
            eventPlace: that.data.locationName,
            eventStatus: "主持人",
            startDate: e.detail.value.startDate,
            startTime: e.detail.value.startTime,
            endDate: e.detail.value.endDate,
            endTime: e.detail.value.endTime,
            eventDetails: e.detail.value.eventDetails,
            opTime: now(),
            openid: app.globalData.openid
          },
          success: res => {
            // 在返回结果中会包含新创建的记录的 _id        
            wx.showToast({
              title: '创建活动成功',
              duration: 2000,
            })
            console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
            wx.navigateTo({
              url: '../index/index',
            })
          },
          fail: err => {
            wx.showToast({
              icon: 'none',
              title: '创建活动失败'
            })
            console.error('[数据库] [创建活动] 失败：', err)
          }
        })

      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '创建活动失败'
        })
        console.error('[数据库] [创建活动] 失败：', err)
      }
    })

    

  },
  formReset: function () {
    console.log('form发生了reset事件')
    wx.redirectTo({
      url: '../index/index'
    })
  }

})