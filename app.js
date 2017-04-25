const schedule = require('node-schedule')
const request = require('request')
const Agent = require('socks5-https-client/lib/Agent')

//网址
const host = 'https://ssfastproxy.com'
const loginPath = `${host}/auth/login`
const checkInPath = `${host}/user/checkin`

//代理
const agentOptions = {
  socksHost: 'localhost',
  socksPort: '6153'
}

//账号
const accounts = [
  {userName: 'userName', email: 'emmail', passwd: 'passwd'}
]

//签到
const checkIn = (user) => {
  request.post({
    url: checkInPath,
    agentClass: Agent,
    agentOptions,
    json: true,
    headers: {'Cookie': user.cookie}
  }, function (err, res) {
    if (err) {
      console.log(`checkIn error:${err.message},${user.userName}`)
    }
    console.log(new Date().toLocaleString(), user.userName, res.body.msg)
  })
}

/**
 * 登录账号
 * @param user
 * @param callback
 */
const login = (user, callback) => {
  request.post({
    url: loginPath,
    agentClass: Agent,
    agentOptions,
    json: true,
    body: {
      email: user.email,
      passwd: user.passwd
    }
  }, function (err, res) {
    if (err) {
      console.log(`login error:${err.message},${user.userName}`)
    }
    console.log(new Date().toLocaleString(), user.userName, res.body.msg)
    user.cookie = res.headers['set-cookie']
    callback(user)
  })
}

//签到所有账号
const checkInAll = () => {
  accounts.forEach(n => {
    //以下是接受数据的代码
    if (n.cookie) {
      checkIn(n)
    }
    else {
      login(n, checkIn)
    }
  })
}

//定时签到
schedule.scheduleJob({hour: 9, minute: 0}, () => {
  console.log('Time for CheckIn!')
  checkInAll()
})

console.log('开始运行定时任务!!!')

checkInAll()

