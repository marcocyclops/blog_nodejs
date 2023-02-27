const { getList, getDetail, newBlog, updateBlog, deleteBlog } = require('../controller/blog.js')
const { SuccessModel, ErrorModel } = require('../model/resModel.js')

const loginCheck = (req) => {
    if (!req.session.username) {
        return Promise.resolve(new ErrorModel('Please login first.'))
    }
}

module.exports = (req, res) => {
    const method = req.method
    const id = req.query.id ?? ''

    if (method == 'GET' && req.path == '/api/blog/list') {
        let author = req.query.author ?? ''
        const keyword = req.query.keyword ?? ''

        if (req.query.isadmin) {
            // check whether is login admin
            const loginCheckResult = loginCheck(req)
            if (loginCheckResult) {
                // return if not login
                return loginCheckResult
            }
            // set author to current login admin, then will get the posts only belong to the admin
            author = req.session.username
        }

        const result = getList(author, keyword)
        return result.then((listData) => {
            return new SuccessModel(listData)
        })
    }

    if (method == 'GET' && req.path == '/api/blog/detail') {
        const result = getDetail(id)
        return result.then((detailData) => {
            return new SuccessModel(detailData)
        })
    }

    if (method == 'POST' && req.path == '/api/blog/new') {
        const loginCheckResult = loginCheck(req)
        if (loginCheckResult) {
            return loginCheckResult
        }

        req.body.author = req.session.username
        const result = newBlog(req.body)
        return result.then((data) => {
            return new SuccessModel(data)
        })
    }

    if (method == 'POST' && req.path == '/api/blog/update') {
        const loginCheckResult = loginCheck(req)
        if (loginCheckResult) {
            return loginCheckResult
        }

        const result = updateBlog(id, req.body)
        return result.then((resultData) => {
            if (resultData) {
                return new SuccessModel('update successfully.')
            }
            else {
                return new ErrorModel('update failed.')
            }
        })
    }

    if (method == 'POST' && req.path == '/api/blog/delete') {
        const loginCheckResult = loginCheck(req)
        if (loginCheckResult) {
            return loginCheckResult
        }

        const author = req.session.username
        const result = deleteBlog(id, author)
        return result.then((resultData) => {
            if (resultData) {
                return new SuccessModel('delete successfully.')
            }
            else {
                return new ErrorModel('delete failed.')
            }
        })
    }

}