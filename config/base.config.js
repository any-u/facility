const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin: CleanPlugin } = require('clean-webpack-plugin');
const {
  CheckerPlugin,
  TsConfigPathsPlugin,
} = require('awesome-typescript-loader');

const imageInlineSizeLimit = parseInt(
  process.env.IMAGE_INLINE_SIZE_LIMIT || '10000'
);

const extensionBaseConfig = {
  name: 'extension',
  entry: path.resolve(__dirname, '../src/extension.ts'),
  target: 'node',
  node: {
    __dirname: false,
  },
  devtool: 'source-map',
  output: {
    libraryTarget: 'commonjs2',
    filename: 'extension.js',
  },
  externals: {
    vscode: 'commonjs vscode',
  },
  module: {
    rules: [
      {
        exclude: /node_modules|\.d\.ts$/,
        test: /\.tsx?$/,
        use: {
          loader: 'awesome-typescript-loader',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  plugins: [
    new CleanPlugin({
      cleanOnceBeforeBuildPatterns: ['**/*'],
    }),
    new TsConfigPathsPlugin({
      configFileName: path.resolve(__dirname, '../tsconfig.json'),
    }),
    new CheckerPlugin(),
  ],
  stats: {
    all: false,
    assets: true,
    builtAt: true,
    env: true,
    errors: true,
    timings: true,
    warnings: true,
  },
};

const webviewBaseConfig = {
  name: 'webview',
  devtool: 'source-map',
  entry: path.resolve(__dirname, '../webview/index.tsx'),
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '../dist/webview'),
  },
  resolve: {
    modules: [path.resolve(__dirname, '../webview'), 'node_modules'],
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, '../webview'),
    },
  },
  module: {
    rules: [
      { parser: { requireEnsure: false } },
      {
        oneOf: [
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            loader: require.resolve('url-loader'),
            include: path.resolve(__dirname, '../webview'),
            options: {
              limit: imageInlineSizeLimit,
              name: 'static/media/[name].[hash:8].[ext]',
            },
          },
          {
            test: /\.(js|mjs|jsx)$/,
            include: path.resolve(__dirname, '../webview'),
          },
          {
            test: /\.(ts|tsx)$/,
            include: path.resolve(__dirname, '../webview'),
            use: {
              loader: 'awesome-typescript-loader',
            },
          },
          {
            test: /\.scss$/,
            include: path.resolve(__dirname, '../webview'),
            use: [
              {
                loader: MiniCssExtractPlugin.loader,
              },
              {
                loader: 'css-loader',
                options: {
                  sourceMap: true,
                  url: false,
                },
              },
              {
                loader: 'sass-loader',
                options: {
                  sourceMap: true,
                },
              },
            ],
          },
        ],
      },
    ],
  },
  stats: {
    all: false,
    assets: true,
    builtAt: true,
    env: true,
    errors: true,
    timings: true,
    warnings: true,
  },
  plugins: [
    new TsConfigPathsPlugin({
      configFileName: path.resolve(__dirname, '../webview.tsconfig.json'),
    }),
    new CheckerPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
  ],
};

module.exports = {
  extensionBaseConfig,
  webviewBaseConfig,
};
