module.exports = class Plugin{
    constructor(options) {
        this.options = options
    }
    apply(compiler) {
        console.log('My plugin is executed!')
        console.log('My plugin options', this.options)
    }
}