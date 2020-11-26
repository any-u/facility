'use strict'
const { CleanWebpackPlugin: CleanPlugin } = require('clean-webpack-plugin')
const ForkTsCheckerPlugin = require('fork-ts-checker-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = function (env, argv) {
  env = env || {}

  return getExtensionConfig(env)
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
      fsevents: 'fsevents'
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

