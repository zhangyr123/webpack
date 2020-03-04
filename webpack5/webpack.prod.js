'use strict'

const glob = require('glob')
const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
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

const { entry, htmlWebpackPlugins } = setMPA()

module.exports = {
    entry: entry,
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name]_[chunkhash:8].js' // js的文件指纹
    },
    mode: 'none',
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
                    // 'style-loader',
                    MiniCssExtractPlugin.loader, //此处会和style-loader冲突，将style-loader注释
                    'css-loader',
                ]
            },
            {
                test: /\.less$/,
                use: [
                    // 'style-loader',
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'less-loader',
                    {// 自动补齐css前缀
                        loader: 'postcss-loader',
                        options: {
                            plugins:() => [
                                require('autoprefixer')({
                                    overrideBrowserslist: ['last 2 version', '>1%']
                                    // 最近两个版本， 用户人数1%以上
                                })
                            ]
                        }
                    },
                    {// px转成rem
                        loader: 'px2rem-loader',
                        options: {
                            remUnit:75, //rem相对px转换的单位，75是指1rem是75px
                            remPrecesion: 8 // px转换为rem的小数点位数
                        }
                    }
                ]
            },
            {//图片解析
                test: /\.(png|jpg|gif|jpeg)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name]_[hash:8][ext]' // 图片和字体的文件指纹
                        }
                    }
                ]
                // use: [
                //     {
                //         loader: 'url-loader',
                //         options: {
                //             limit: 40960 // 此处表示图片小于40k，webpack打包时会自动base64
                //         }
                //     }
                // ]
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name]_[hash:8][ext]'
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name]_[contenthash:8].css'  //设置css指纹
        }),
        new OptimizeCssAssetsWebpackPlugin({
            assetNameRegExp: /\.css$/g,
            cssProcessor: require('cssnano') // css处理器
        }),
        new CleanWebpackPlugin()
    ].concat(htmlWebpackPlugins),
    devtool: 'source-map'
}