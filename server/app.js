const querystring = require('querystring')

const { access } = require('./src/utils/log.js')

const handleBlogRouter = require('./src/router/blog.js')
const handleUserRouter = require('./src/router/user.js')

const getCookieExpires = () => {
    const d = new Date()
    d.setTime(d.getTime() + (24 * 60 * 60 * 1000))
    return d.toGMTString()
}

const SESSION_DATA = {}

// handle post data before pass to router
const getPostData = (req) => {
    const promise = new Promise((resolve, reject) => {
        if (req.method !== 'POST') {
            resolve({})
            return
        }
        if (req.headers['content-type'] !== 'application/json') {
            resolve({})
            return
        }
        let postData = ''
        req.on('data', chunk => {
            postData += chunk.toString()
        })
        req.on('end', () => {
            if (!postData) {
                resolve({})
                return
            }
            console.log('postdata', postData)
            resolve(
                JSON.parse(postData)
            )
        })
    })
    return promise
}

const serverHandle = (req, res) => {
    // logging
    access(`${req.method} -- ${req.url} -- ${req.headers['user-agent']} -- ${Date.now()}`)

    // process.env.NODE_ENV
    res.setHeader('content-type', 'application/json')
    req.path = req.url.split('?')[0]
    req.query = querystring.parse(req.url.split('?')[1])

    // get cookies
    req.cookie = {}
    const cookieStr = req.headers.cookie ?? ''
    cookieStr.split(';').forEach((item) => {
        const arr = item.split('=')
        const key = arr[0]?.trim()
        const val = arr[1]?.trim()
        req.cookie[key] = val
    })

    // get session
    let needSetCookie = false
    let userId = req.cookie.userid
    if (userId) {
        if (!SESSION_DATA[userId]) {
            SESSION_DATA[userId] = {}
        }
    }
    else {
        needSetCookie = true
        userId = `${Date.now()}_${Math.random()}`
        SESSION_DATA[userId] = {}
    }
    req.session = SESSION_DATA[userId]
    
    getPostData(req).then(postData => {
        req.body = postData
        
        const blogResult = handleBlogRouter(req, res)
        if (blogResult) {
            blogResult.then((blogData) => {
                if (needSetCookie) {
                    res.setHeader('Set-Cookie', `userid=${userId}; path=/; httpOnly; expires=${getCookieExpires()};`)
                }
                res.end(JSON.stringify(blogData ))
            })
            return
        }
    
        const userResult = handleUserRouter(req, res)
        if (userResult) {
            userResult.then((userData) => {
                if (needSetCookie) {
                    res.setHeader('Set-Cookie', `userid=${userId}; path=/; httpOnly; expires=${getCookieExpires()};`)
                }
                res.end(JSON.stringify(userData))
            })
            return
        }
    
        res.writeHead(404, {'content-type': 'text/plain'})
        res.write('404 - file not found')
        res.end()
    })
}

module.exports = serverHandle