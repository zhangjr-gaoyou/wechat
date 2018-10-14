// letsparty/pages/displayEventMore/displayEventMore.js

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    events: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    var that = this;
    wx.showLoading();

    
    console.log('openid', app.globalData.openid);

    const db = wx.cloud.database()
    
    db.collection('user-event').orderBy('startDate', 'desc')
      .where({
        '_openid': app.globalData.openid,
      })
      .get({
        success: function (res) {
          wx.hideLoading();
          // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条

          that.setData({
            events: res.data,
          });
          
          for (var j = 0, len = that.data.events.length; j < len; j++) {
            
            var param = {};
            var event = 'events['+j+'].isTouchMove';
           
            param[event] = false;
            that.setData(param);
            
          
          }

          console.log('all events', that.data.events)
        },

        fail: function(err){
          wx.hideLoading();
          console.log(err);
        },

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

  // 左滑删除

  angle: function (start, end) {
    var _X = end.X - start.X,
      _Y = end.Y - start.Y
    //返回角度 /Math.atan()返回数字的反正切值
    return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
  },


  touchstart(e) {
    //开始触摸时 重置所有删除
    this.data.events.forEach(function (v, i) {
      if (v.isTouchMove)//只操作为true的
        v.isTouchMove = false;
    })
    this.setData({
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      events: this.data.events
    })
  },
  //滑动事件处理
  touchmove(e) {
    let index = e.currentTarget.dataset.index;//当前索引
    let startX = this.data.startX;//开始X坐标
    let startY = this.data.startY;//开始Y坐标
    let touchMoveX = e.touches[0].clientX;//滑动变化坐标
    let touchMoveY = e.touches[0].clientY;//滑动变化坐标
    //获取滑动角度
    let angle = this.angle({ X: startX, Y: startY }, { X: touchMoveX, Y: touchMoveY });
    this.data.events.forEach((v, i) => {
      v.isTouchMove = false
      //滑动超过30度角 return
      if (Math.abs(angle) > 30) return;
      if (i == index) {
        if (touchMoveX > startX) //右滑
          v.isTouchMove = false
        else //左滑
          v.isTouchMove = true
      }
    })
    //更新数据
    this.setData({
      events: this.data.events
    })
  },

  touchend(e) {
  
  
  },


  //删除事件
  delEvent(e) {
    this.data.events.splice(e.currentTarget.dataset.index, 1)
    this.setData({
      events: this.data.events,
    })
    console.log('remove this event', e.currentTarget.id);

    wx.showLoading();
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'remove',
      // 传递给云函数的参数
      data: {
        eventId: e.currentTarget.id,
      },
      success: res => {
        wx.hideLoading();
        wx.showToast({
          icon: 'success',
          title: '成功删除活动！',
        })
        console.log(res)

      },
      fail: err => {
        wx.hideLoading();
        wx.showToast({
          icon: 'none',
          title: '删除活动失败！',
        })
        console.error('[云函数] [update] 调用失败：', err)
      }
    })
  },
   

})