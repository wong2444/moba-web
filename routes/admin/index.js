module.exports = app => {
    const express = require('express')
    const jwt = require('jsonwebtoken')
    const AdminUser = require('../../models/AdminUser')
    const assert = require('http-assert')
    const authMiddleware = require('../../middleware/auth')
    const resourceMiddleware = require('../../middleware/resource')
    const mongoose = require('mongoose')
    const router = express.Router({
        mergeParams: true//合併父路由參數到子路由中
    })
    router.post('/', authMiddleware(), async (req, res) => {
        const model = await req.Model.create(req.body)
        res.send(model)//發回客戶端
    })
    router.put('/:id', authMiddleware(), async (req, res) => {

        const model = await req.Model.findByIdAndUpdate(req.params.id, req.body)
        res.send(model)//發回客戶端
    })
    router.get('/', authMiddleware(), async (req, res) => {
        const queryOptions = {}
        if (req.Model.modelName === 'Category') {
            queryOptions.populate = 'parent'
        } else if (req.Model.modelName === 'Hero' || 'Article') {

            const Category = mongoose.model('Category')//在mongoose中拿到已加載的model
            queryOptions.populate = {path: 'categories', model: Category}

        }
        const items = await req.Model.find().setOptions(queryOptions).limit(100)
        res.send(items)//發回客戶端
    })
    router.get('/:id', authMiddleware(), async (req, res) => {
        const item = await req.Model.findOne({_id: req.params.id})
        res.send(item)//發回客戶端
    })
    router.delete('/:id', authMiddleware(), async (req, res) => {
        await req.Model.findByIdAndDelete({_id: req.params.id})
        res.send({success: 1})//發回客戶端
    })
    app.use('/admin/api/rest/:resource', resourceMiddleware(), authMiddleware(), router)
    const multer = require('multer')
    const upload = multer({dest: __dirname + '/../../uploads'})
    app.post('/admin/api/upload', upload.single('file'), authMiddleware(), async (req, res) => {
        const file = req.file
        file.url = `http://mobagame.tk/uploads/${file.filename}`
        res.send(file)
    })
    app.post('/admin/api/login', async (req, res) => {
        let {username, password} = req.body

        let user = await AdminUser.findOne({username}).select('+password')
        assert(user, 422, '用戶不存在')
        // if (!user) {
        //     return res.status(422).send({
        //         message: '用戶不存在'
        //     })
        // }
        const isValid = require('bcrypt').compareSync(password, user.password)
        assert(isValid, 422, '密碼錯誤')
        //返回token

        const token = jwt.sign({id: user._id}, app.get('secret'))
        res.send({token})

    })

    app.use(async (err, req, res, next) => {
        //錯誤處理中間件
        res.status(err.statusCode || 500).send(
            {
                message: err.message
            }
        )
    })

}
