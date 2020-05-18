const merge = require('webpack-merge');
const { webviewBaseConfig, extensionBaseConfig } = require('./base.config');

const extensionProdConfig = merge(extensionBaseConfig, {
  mode: 'production',
  bail: true,
});

const webviewProdConfig = merge(webviewBaseConfig, {
  mode: 'production',
  bail: true,
});

module.exports = function () {
  return [extensionProdConfig, webviewProdConfig];
};
