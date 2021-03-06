// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()


exports.main = async (event, context) => {
  try {
    return await db.collection('user-event').where({
      eventId: event.eventId
    })
      .update({
        data: {
          eventStatus: '结束',
          opTime: event.opTime
        },
      })
  } catch (e) {
    console.error(e)
  }
}