const { loginAuth } = require('../controller/user.js')
const { SuccessModel, ErrorModel } = require('../model/resModel.js')
const redis = require('../database.redis.js')

const getCookieExpires = () => {
    const d = new Date()
    d.setTime(d.getTime() + (24 * 60 * 60 * 1000))
    return d.toGMTString()
}

module.exports = (req, res) => {
    const method = req.method

    if (method == 'POST' && req.path == '/api/user/login') {
        const { username, password } = req.body
        const result = loginAuth(username, password) 
        return result.then((data) => {
            if (data.username) {
                // login successfully
                req.session.username = data.username
                req.session.realname = data.realname
                // sync to redis
                redis.set(req.sessionId, req.session)
                return new SuccessModel(data, 'login successfully')
            }
            else {
                return new ErrorModel('login failed')
            }
        })
    }

    if (method == 'POST' && req.path == '/api/user/logout') {
        const promise = new Promise(() => {
            req.session.username = ''
            req.session.realname = ''
            resolve(new SuccessModel('Logout successfully'))
        })
        return (promise)
    }

}