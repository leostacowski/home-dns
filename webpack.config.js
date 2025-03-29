import path from 'path'

export default {
  mode: 'production',
  entry: './src/core/index.js',
  resolve: {
    alias: {
      '@common': path.resolve(process.cwd(), 'src/common/'),
      '@core': path.resolve(process.cwd(), 'src/core/'),
      '@modules': path.resolve(process.cwd(), 'src/modules/'),
      '@scripts': path.resolve(process.cwd(), 'src/scripts/'),
    },
  },
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
