'use strict'

const glob = require('glob')
const path = require('path')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const SpeedMeasureWebpackPlugin = require('speed-measure-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const HappyPack = require('happypack')
const TerserPlugin = require('terser-webpack-plugin')
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin')
const PurgecssPlugin = require('purgecss-webpack-plugin')

const smp = new SpeedMeasureWebpackPlugin()

const PATHS = {
    src: path.join(__dirname, 'src')
}

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
                chunks: ['vendors', pageName],
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

// module.exports = smp.wrap({
module.exports = {
    entry: entry,
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name]_[chunkhash:8].js' // js的文件指纹
    },
    mode: 'production',
    module: {
        rules: [
            // 解析ES6
            {
                test: /\.js$/,
                // exclude: 'node_modules',
                include: path.resolve('src'), // 只对项目根目录下的src目录中的文件采用babel-loader
                use: [
                    {
                        loader: 'thread-loader',
                        options: {
                            workers: 3
                        }
                    },
                    {
                        loader: 'babel-loader',
                        options: {
                            cacheDirectory: true
                        }
                    },
                    // 'happypack/loader'
                    // 'eslint-loader'
                ]
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
                    },
                    {
                        loader: 'image-webpack-loader',
                        options: {
                            mozjpeg: {
                                progressive: true,
                                quality: 65
                            },
                            // optipng.enabled: false will disable optipng
                            optipng: {
                                enabled: false,
                            },
                            pngquant: {
                                quality: [0.65, 0.90],
                                speed: 4
                            },
                            gifsicle: {
                                interlaced: false,
                            },
                            // the webp option will enable WEBP
                            webp: {
                                quality: 75
                            }
                        }
                    },
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
        new CleanWebpackPlugin(),
        // new HtmlWebpackExternalsPlugin({
        //     externals: [
        //         {
        //             module: 'react',
        //             entry: 'https://11.url.cn/now/lib/16.2.0/react.min.js', // 可以是本地，也可以是cdn
        //             global: 'React'
        //         },
        //         {
        //             module: 'react-dom',
        //             entry: 'https://11.url.cn/now/lib/16.2.0/react-dom.min.js',
        //             global: 'ReactDOM'
        //         }
        //     ]
        // }),
        // new webpack.optimize.ModuleConcatenationPlugin(),
        new FriendlyErrorsWebpackPlugin(),
        function() {
            this.hooks.done.tap('done', (stats) => {// webpack4之前的写法把hook.done.tap改成plugin
                if(stats.compilation.errors && stats.compilation.errors.length && process.argv.indexOf('--watch')==-1) {
                    console.log('build error')
                    process.exit(1)
                }
            })
        },
        // new BundleAnalyzerPlugin(),
        // new HappyPack({
        //     loaders: ['babel-loader']
        // }),
        new webpack.DllReferencePlugin({
            manifest: require('./build/library/library.json')
        }),
        new HardSourceWebpackPlugin(),
        new PurgecssPlugin({
            paths: glob.sync(`${PATHS.src}/**/*`, {nodir: true})
        })
    ].concat(htmlWebpackPlugins),
    devtool: 'none',
    // optimization: {
    //     splitChunks: {
    //         cacheGroups: {
    //             Commons: {
    //                 test: /(react|react-dom)/,
    //                 name: 'vendors',
    //                 chunks: 'all'
    //             }
    //         }
    //     }
    // }
    optimization: {
        splitChunks: {
            minSize: 0, // 引用的模块的大小，0代表打成commons文件
            cacheGroups: {
                Commons: {
                    name: 'commons',
                    chunks: 'all',
                    minChunks: 2 // 要求至少引用的次数为两次。
                }
            }
        },
        minimizer: [
            new TerserPlugin({
                parallel: true,
                cache: true
            })
        ]
    },
    resolve: {
        alias: {
            'react': path.resolve(__dirname, './node_modules/react/umd/react.production.min.js'),
            'react-dom': path.resolve(__dirname, './node_modules/react-dom/umd/react-dom.production.min.js')
        },
        extensions: ['.js'],
        mainFields: ['main']
    },
    // stats: 'errors-only'
// })
}