
function nowDateTime() {
  var today = new Date();

  var tomon = today.getMonth() + 1;
  var tomonStr = tomon;
  if (tomon < 10)
    tomonStr = '0' + tomon;
  var todd = today.getDate();
  var toddStr = todd;
  if (todd < 10)
    toddStr = '0' + todd;
  var todayStr = today.getFullYear() + '-'
    + tomonStr + '-'
    + toddStr;

  var tohh = today.getHours();
  var tohhStr = tohh;
  if (tohh < 10)
    tohhStr = '0' + tohh;
  var tomi = today.getMinutes();
  var tomiStr = tomi;
  if (tomi < 10)
    tomiStr = '0' + tomi;
  var toss = today.getSeconds();
  var tossStr = toss;
  if (toss < 10)
    tossStr = '0' + toss;
  var nowStr = today.getFullYear() + '-'
    + tomonStr + '-'
    + toddStr + ' '
    + tohhStr + ':'
    + tomiStr + ':'
    + tossStr;

  console.log('now:', nowStr);
  return nowStr;
  

}


module.exports = {
  nowDateTime
}