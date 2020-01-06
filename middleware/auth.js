module.exports = options => {
    return async (req, res, next) => {
        const jwt = require('jsonwebtoken')
        const AdminUser = require('../models/AdminUser')
        const assert = require('http-assert')

        const token = String(req.headers.authorization || '').split(' ')[1]
        assert(token, 401, '請先登錄1')
        const {id} = jwt.verify(token, req.app.get('secret'))
        assert(id, 401, '請先登錄2')
        req.user = await AdminUser.findById(id)
        assert(req.user, 401, '請先登錄3')
        await next()
    }
}
