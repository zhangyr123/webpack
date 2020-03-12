
const TerserPlugin= require('terser-webpack-plugin')

module.exports = {
    entry: {
        'large-number': './src/index.js', //非压缩版
        'large-number.min': './src/index.js' //压缩版
    },
    output: {
        filename: '[name].js', // 打包出来的文件是large-number.js和large-number.min.js
        library: 'largeNumber', // 打包出的库的名字
        libraryTarget: 'umd', // 打包的库可以通过什么方式调用
        libraryExport: 'default' // 不设置成default，调用时的方式是libraryTarget.default
    },
    mode: 'none',
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({ // webpack4中mode为production，默认压缩,该插件可指定文件压缩
                include: /\.min\.js$/,
            })
        ]
    }
}