// letsparty/pages/displayAll/displayAll.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputShowed: false,
    inputVal: "",
    eventId: null,
  },


  showInput: function () {
    this.setData({
      inputShowed: true
    });
  },
  hideInput: function () {
    this.setData({
      inputVal: "",
      inputShowed: false
    });
  },
  clearInput: function () {
    this.setData({
      inputVal: ""
    });

    console.log('clear Input');
  },

  inputTyping: function (e) {
    this.setData({
      inputVal: e.detail.value
    });

    console.log('search:',this.data.inputVal);

  },

  

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    var that = this;

    that.setData({
      eventId: options.eventId,
    })

    console.log('eventId:',that.data.eventId);

    const db = wx.cloud.database()
    db.collection('user-event').orderBy('startDate', 'desc')
      .where({
        eventId: that.data.eventId,
      })
      .get({
        success: function (res) {
          wx.hideLoading();
          // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
          console.log(res.data.length);

          that.setData({
            userCount: res.data.length,
            events: res.data,

          });
         
          console.log('events', that.data.events)
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

  actionSheetTap(ctx) {

    console.log('context:',ctx);

    var that = this;

    

    for (var j = 0, len = that.data.events.length; j < len; j++) {
      console.log(that.data.events[j]);
      if (that.data.events[j].userName == ctx.currentTarget.id){


        if(that.data.events[j].userRole=='参与者'){
          that.setData({

            tapUserName: that.data.events[j].realName,
            tapUserPhone: that.data.events[j].userPhone,
            

          });
        }
        that.setData({

          tapUserNickName: that.data.events[j].userName,
          tapUserId: that.data.events[j].openid,

        });
        
        break;
      }
    }

    
       


    wx.showActionSheet({

      itemList: ['成员信息', '呼叫', '跟踪位置'],
      success(e) {
        console.log(e.tapIndex)
        switch (e.tapIndex) {
          case 0:
            
            wx.showModal({
              title: '成员真实信息',
              content: '姓名:' + that.data.tapUserName + '  手机' + that.data.tapUserPhone,
              showCancel: false,
              confirmText: '关闭'
            });

            
            break;
          case 1:
            
            wx.makePhoneCall({
              phoneNumber: that.data.tapUserPhone
            })
            
            break;
          case 2:

            let url = '../traceLocation/traceLocation' +
              '?eventId=' + that.data.eventId +
              '&guestName=' + that.data.tapUserNickName +
              '&guestId=' + that.data.tapUserId;


            console.log('url:',url);

            wx.navigateTo({
              url: url,
            })
            break;  
          default:
            
        }
      }
    })
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})