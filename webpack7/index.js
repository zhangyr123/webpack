if(process.env.NODE_ENV === 'production') {
    module.exports = require('./dist/large-number.min.js') // 生产环境
} else {
    module.exports = require('./dist/large-number.js') // 非生产环境
}