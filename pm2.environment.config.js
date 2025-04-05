module.exports = [
  {
    cwd: './home-dns',
    script: './dist/core.bundle.js',
    name: 'home-dns',
    interpreter_args: '--harmony',
    env_production: {
      NODE_ENV: 'production',
    },
  },
]
