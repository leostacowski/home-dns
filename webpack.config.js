const path = require('path')
const webpack = require('webpack')
const dotenv = require('dotenv')

dotenv.config()

module.exports = {
  mode: 'production',
  target: 'node',
  entry: {
    core: {
      import: './src/core/index.js',
    },
  },
  resolve: {
    alias: {
      '@common': path.resolve(process.cwd(), './src/common/'),
      '@core': path.resolve(process.cwd(), './src/core/'),
      '@modules': path.resolve(process.cwd(), './src/modules/'),
    },
  },
  output: {
    clean: true,
    path: path.resolve(process.cwd(), 'dist'),
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env),
    }),
  ],
}
