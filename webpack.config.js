import path from 'path'

export default {
  mode: 'production',
  entry: './src/core/index.js',
  output: {
    path: path.resolve(process.cwd(), 'dist'),
    filename: 'main.bundle.js',
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
  target: 'node',
}
