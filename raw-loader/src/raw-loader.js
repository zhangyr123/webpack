const loaderUtils = require('loader-utils')
const fs = require('fs')
const path = require('path')


module.exports = function(source) {
    const { name } = loaderUtils.getOptions(this)
    
    console.log('name', name)

    this.cacheable(false) // 将loader的默认缓存关掉

    const callback = this.async()

    const json = JSON.stringify(source)
         .replace(/\u2028/g, '\\u2028')
         .replace(/\u2029/g, '\\u2029')

    fs.readFile(path.join(__dirname, './async.txt'), 'utf-8', (err, data) => { // 异步处理
        if(err) {
            callback(err, '')
        }
        callback(null, data)
    })

    // return `export default ${json}` // 只能传递一个值
    // this.callback(null, json, 1, 2, 3) //传递一个值，或多个值

    // throw new Error('Error') // 抛出异常的第一种方式
    // this.callback(new Error('Error'), json) // 抛出异常的第二种方式
}