const path = require('path')

module.exports = {
  mode: 'production',
  target: 'node',
  entry: {
    deps: ['winston'],
    core: {
      import: './src/core/index.js',
      dependOn: ['deps'],
    },
    udp_proxy_worker: {
      import: './src/modules/udp_proxy/modules/worker.js',
      dependOn: ['deps'],
    },
    tcp_proxy_worker: {
      import: './src/modules/tcp_proxy/modules/worker.js',
      dependOn: ['deps'],
    },
  },
  resolve: {
    alias: {
      '@common': path.resolve(process.cwd(), './src/common/'),
      '@config': path.resolve(process.cwd(), './src/config/'),
      '@core': path.resolve(process.cwd(), './src/core/'),
      '@modules': path.resolve(process.cwd(), './src/modules/'),
      '@scripts': path.resolve(process.cwd(), './src/scripts/'),
    },
  },
  output: {
    clean: true,
    path: path.resolve(process.cwd(), 'dist'),
    filename: '[name].bundle.js',
    chunkLoading: 'async-node',
    chunkFormat: 'commonjs',
    chunkFilename: 'chunk.[id].js',
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
