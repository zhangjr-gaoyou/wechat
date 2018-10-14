// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()


// 云函数入口函数
exports.main = async (event, context) => {

  try {
    return await db.collection('user-trace').doc(event.traceId)
      .update({
        data: {
          status: 1,
          opTime: event.now,
        },
      })
  } catch (e) {
    console.error(e)
  }
    
}