const http = require('http')
const serverHandle = require('../app.js')

const PORT = 8000
const WEBSITE = 'localhost'

const server = http.createServer(serverHandle)

server.listen(PORT, WEBSITE, () => {
    console.log('NodeJs is listening to port 8000...')
    console.log('===================================')
})
