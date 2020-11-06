'use strict'
const fs = require('fs')
const path = require('path')
const { CleanWebpackPlugin: CleanPlugin } = require('clean-webpack-plugin')
const ForkTsCheckerPlugin = require('fork-ts-checker-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlPlugin = require('html-webpack-plugin')

module.exports = function (env, argv) {
  env = env || {}

  return getExtensionConfig(env)
  // return [getExtensionConfig(env), getWebviewsConfig(env)]
}

function getExtensionConfig(env) {
  const plugins = [
    new CleanPlugin({
      cleanOnceBeforeBuildPatterns: ['**/*', '!**/webviews/**'],
    }),
    new ForkTsCheckerPlugin({
      async: false,
      eslint: undefined
    }),
  ]

  return {
    name: 'extension',
    entry: './src/extension.ts',
    mode: env.production ? 'production' : 'development',
    target: 'node',
    node: {
      __dirname: false,
    },
    devtool: 'source-map',
    output: {
      libraryTarget: 'commonjs2',
      filename: 'extension.js',
    },
    optimization: {
      minimizer: [
        new TerserPlugin({
          cache: true,
          parallel: true,
          sourceMap: true,
          terserOptions: {
            ecma: 8,
            keep_classnames: true,
            module: true,
          },
        }),
      ],
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
            loader: 'ts-loader',
            options: {
              experimentalWatchApi: true,
              transpileOnly: true,
            },
          },
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },
    plugins,
    stats: {
      all: false,
      assets: true,
      builtAt: true,
      env: true,
      errors: true,
      timings: true,
      warnings: true,
    },
  }
}

// function getWebviewsConfig(env) {
//   const clean = ['**/*']
//   const cspPolicy = {
//     'default-src': "'none'",
//     'img-src': ['vscode-resource:', 'https:', 'data:'],
//     'script-src': ['vscode-resource:', "'nonce-Z2l0bGVucy1ib290c3RyYXA='"],
//     'style-src': ['vscode-resource:'],
//   }

//   if (!env.production) {
//     cspPolicy['script-src'].push("'unsafe-eval'")
//   }

//   const plugins = [
//     new CleanPlugin({ cleanOnceBeforeBuildPatterns: clean }),
//     new ForkTsCheckerPlugin({
//       typescript: {
//         configFile: path.resolve(__dirname, 'tsconfig.webviews.json'),
//       },
//       async: false,
//     }),
//     new MiniCssExtractPlugin({
//       filename: '[name].css',
//     }),
//     new HtmlPlugin({
// 			excludeAssets: [/.+-styles\.js/],
//       template: 'index.html',
//       filename: path.resolve(__dirname, 'dist/webviews/index.html'),
//       inject: true,
//       inlineSource: env.production ? '.css$' : undefined,
//       cspPlugin: {
//         enabled: true,
//         policy: cspPolicy,
//         nonceEnabled: {
//           'script-src': true,
//           'style-src': true,
//         },
//       },
//       minify: env.production
//         ? {
//             removeComments: true,
//             collapseWhitespace: true,
//             removeRedundantAttributes: false,
//             useShortDoctype: true,
//             removeEmptyAttributes: true,
//             removeStyleLinkTypeAttributes: true,
//             keepClosingSlash: true,
//             minifyCSS: true,
//           }
//         : false,
//     }),
//     new HtmlExcludeAssetsPlugin(),
//     new CspHtmlPlugin(),
//     new ImageminPlugin({
//       disable: !env.optimizeImages,
//       externalImages: {
//       	context: path.resolve(__dirname, 'src/webviews/apps/images'),
//       	sources: glob.sync('src/webviews/apps/images/settings/*.png'),
//       	destination: path.resolve(__dirname, 'images')
//       },
//       cacheFolder: path.resolve(
//         __dirname,
//         'node_modules',
//         '.cache',
//         'imagemin-webpack-plugin'
//       ),
//       gifsicle: null,
//       jpegtran: null,
//       optipng: null,
//       pngquant: {
//         quality: '85-100',
//         speed: env.production ? 1 : 10,
//       },
//       svgo: null,
//     }),
//     new HtmlInlineSourcePlugin(),
//   ]

//   return {
//     name: 'webviews',
//     context: path.resolve(__dirname, 'src/webviews/apps'),
//     entry: {
//       'main-styles': ['./scss/main.scss'],
//       skeleton: ['./index.ts'],
//     },
//     mode: env.production ? 'production' : 'development',
//     devtool: env.production ? undefined : 'eval-source-map',
//     output: {
//       filename: '[name].js',
//       path: path.resolve(__dirname, 'dist/webviews'),
//       publicPath: '#{root}/dist/webviews/',
//     },
//     module: {
//       rules: [
//         {
//           exclude: /node_modules|\.d\.ts$/,
//           test: /\.tsx?$/,
//           use: {
//             loader: 'ts-loader',
//             options: {
//               configFile: 'tsconfig.webviews.json',
//               transpileOnly: true,
//             },
//           },
//         },
//         {
//           test: /\.scss$/,
//           use: [
//             {
//               loader: MiniCssExtractPlugin.loader,
//             },
//             {
//               loader: 'css-loader',
//               options: {
//                 sourceMap: true,
//                 url: false,
//               },
//             },
//             {
//               loader: 'sass-loader',
//               options: {
//                 sourceMap: true,
//               },
//             },
//           ],
//           exclude: /node_modules/,
//         },
//       ],
//     },
//     resolve: {
//       extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
//       modules: [path.resolve(__dirname, 'src/webviews/apps'), 'node_modules'],
//     },
//     plugins: plugins,
//     stats: {
//       all: false,
//       assets: true,
//       builtAt: true,
//       env: true,
//       errors: true,
//       timings: true,
//       warnings: true,
//     },
//   }
// }
