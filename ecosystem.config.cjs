module.exports = {
  apps: [
    {
      name: 'nome-magnetico',
      script: './dist/server/entry.mjs',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        PORT: 4321,
        NODE_ENV: 'production',
      },
    },
  ],
};
