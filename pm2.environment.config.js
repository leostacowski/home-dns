module.exports = [
  {
    cwd: '/dist',
    script: './core.bundle.js',
    name: 'home-dns',
    interpreter_args: '--harmony',
    env_production: {
      NODE_ENV: 'production',
    },
  },
]
