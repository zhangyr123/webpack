const autoprefixer = require('autoprefixer');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const glob = require('glob');
const path = require('path');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin'); // 命令行信息显示

const projectRoot = process.cwd()

const setMPA = () => {
  const entry = {};
  const htmlWebpackPlugins = [];

  const entryFiles = glob.sync(path.join(projectRoot, './src/*/index.js')); // 获取入口

  Object.keys(entryFiles).map((index) => {
    const entryFile = entryFiles[index];

    // 获取pagename
    const match = entryFile.match(/src\/(.*)\/index\.js/);
    const pageName = match && match[1];

    entry[pageName] = entryFile;

    return htmlWebpackPlugins.push(
      new HtmlWebpackPlugin({
        template: path.join(projectRoot, `src/${pageName}/index.html`),
        filename: `${pageName}.html`,
        chunks: ['vendors', pageName],
        inject: true,
        minify: {
          html5: true,
          collapseWhitespace: true,
          preserveLineBreaks: false,
          minifyCSS: true,
          minifyJS: true,
          removeComments: false,
        },
      }),
    );
  });

  return {
    entry,
    htmlWebpackPlugins,
  };
};

const { entry, htmlWebpackPlugins } = setMPA();

module.exports = {
  entry,
  ooutput: {
    path: path.join(projectRoot, 'dist'),
    filename: '[name]_[chunkhash8].js',
  },
  module: {
    rules: [
      // 解析ES6
      {
        test: /\.js$/,
        use: [
          'babel-loader',
          // 'eslint-loader'
        ],
      },
      {
        test: /\.css$/,
        use: [// 此处要先写style，再写css，因为loader是链式存储，调用是从右到左的。
          // 'style-loader',
          MiniCssExtractPlugin.loader, // 此处会和style-loader冲突，将style-loader注释
          'css-loader',
        ],
      },
      {
        test: /\.less$/,
        use: [
          // 'style-loader',
          MiniCssExtractPlugin.loader,
          'css-loader',
          'less-loader',
          { // 自动补齐css前缀
            loader: 'postcss-loader',
            options: {
              plugins: () => [
                autoprefixer({
                  overrideBrowserslist: ['last 2 version', '>1%'],
                  // 最近两个版本， 用户人数1%以上
                }),
              ],
            },
          },
          { // px转成rem
            loader: 'px2rem-loader',
            options: {
              remUnit: 75, // rem相对px转换的单位，75是指1rem是75px
              remPrecesion: 8, // px转换为rem的小数点位数
            },
          },
        ],
      },
      { // 图片解析
        test: /\.(png|jpg|gif|jpeg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name]_[hash:8][ext]', // 图片和字体的文件指纹
            },
          },
        ],
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
              name: '[name]_[hash:8][ext]',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({ // css单独提取出来
      filename: '[name]_[contenthash:8].css', // 设置css指纹
    }),
    new CleanWebpackPlugin(),
    new FriendlyErrorsWebpackPlugin(),
    function errorPlugin() {
      this.hooks.done.tap('done', (stats) => { // webpack4之前的写法把hook.done.tap改成plugin
        if (stats.compilation.errors && stats.compilation.errors.length && process.argv.indexOf('--watch') === -1) {
          console.log('build error'); //eslint-disable-line
          process.exit(1);
        }
      });
    },
  ].concat(htmlWebpackPlugins),
  stats: 'errors-only',
};
