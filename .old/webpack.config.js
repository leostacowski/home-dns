const path = require('path')

module.exports = {
  mode: 'production',
  target: 'node',
  entry: {
    core: {
      import: '@core/index.js',
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
}
