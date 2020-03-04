'use strict'

const glob = require('glob')
const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-Webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const setMPA = () => {
    const entry = {}
    const htmlWebpackPlugins = []

    const entryFiles = glob.sync(path.join(__dirname, './src/*/index.js')) // 获取入口

    Object.keys(entryFiles).map((index) => {
        const entryFile = entryFiles[index]

        // 获取pagename
        const match = entryFile.match(/src\/(.*)\/index\.js/)
        const pageName = match && match[1]

        entry[pageName] = entryFile

        htmlWebpackPlugins.push(
            new HtmlWebpackPlugin({
                template: path.join(__dirname, `src/${pageName}/index.html`),
                filename: `${pageName}.html`,
                chunks: [pageName],
                inject: true,
                minify: {
                    html5: true,
                    collapseWhitespace: true,
                    preserveLineBreaks: false,
                    minifyCSS: true,
                    minifyJS: true,
                    removeComments: false
                }
            }),
        )
    })

    return {
        entry,
        htmlWebpackPlugins
    }
}

const {entry, htmlWebpackPlugins} = setMPA();

module.exports = {
    entry: entry,
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js'
    },
    mode: 'development',
    module: {
        rules: [
            // 解析ES6
            {
                test: /\.js$/,
                use: 'babel-loader'
            },
            {
                test: /\.css$/,
                use: [//此处要先写style，再写css，因为loader是链式存储，调用是从右到左的。
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.less$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'less-loader'
                ]
            },
            {//图片解析
                test: /\.(png|jpg|gif|jpeg)$/,
                // use: [
                //     'file-loader'
                // ]
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 40960 // 此处表示图片小于40k，webpack打包时会自动base64
                        }
                    }
                ]
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: 'file-loader'
            }
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new CleanWebpackPlugin()
    ].concat(htmlWebpackPlugins),
    devServer: {
        contentBase: './dist',
        hot: true
    },
    devtool: 'none'
}