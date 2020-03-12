// 代码压缩、文件指纹、tree shaking、scope hosisting、速度优化（基础包cdn）、体积优化（代码分割）
const merge = require('webpack-merge');
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin');
const cssnano = require('cssnano');
const baseConfig = require('./webpack.base');

const prodConfig = {
  mode: 'production',
  plugins: [
    new OptimizeCssAssetsWebpackPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessor: cssnano, // css处理器
    }),
    new HtmlWebpackExternalsPlugin({
      externals: [
        {
          module: 'react',
          entry: 'https://11.url.cn/now/lib/16.2.0/react.min.js', // 可以是本地，也可以是cdn
          global: 'React',
        },
        {
          module: 'react-dom',
          entry: 'https://11.url.cn/now/lib/16.2.0/react-dom.min.js',
          global: 'ReactDOM',
        },
      ],
    }),
  ],
  optimization: {
    splitChunks: {
      minSize: 0, // 引用的模块的大小，0代表打成commons文件
      cacheGroups: {
        Commons: {
          name: 'commons',
          chunks: 'all',
          minChunks: 2, // 要求至少引用的次数为两次。
        },
      },
    },
  },
};

module.exports = merge(baseConfig, prodConfig);
