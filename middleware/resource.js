module.exports = options => {
   return async (req, res, next) => {
        const modelName = require('inflection').classify(req.params.resource)//在url中找到動態參數並將其轉為類名
        req.Model = require(`../models/${modelName}`)//使用類名找到對應的model
        await next()
    }
}

