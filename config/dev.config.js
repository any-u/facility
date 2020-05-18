const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { webviewBaseConfig, extensionBaseConfig } = require('./base.config');

const extensionDevConfig = merge(extensionBaseConfig, {
  mode: 'development',
});

const webviewDevConfig = merge(webviewBaseConfig, {
  mode: 'development',
  devServer: {
    contentBase: path.resolve(__dirname, 'dist/webview'),
    compress: true,
    open: false,
    port: 3000,
    hot: true,
    overlay: {
      warnings: true,
      errors: true,
    },
    disableHostCheck: true,
    noInfo: true,
    host: 'localhost',
    after: () => {
      console.info(`[ Build ] finish. Port: ${3000}`);
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../public/index.html'),
      inject: true,
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
      },
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
});

module.exports = [webviewDevConfig];
