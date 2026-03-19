module.exports = {
  apps: [
    {
      name: 'nome-magnetico',
      script: './dist/server/entry.mjs',
      instances: 'max',
      exec_mode: 'cluster',
      node_args: '--env-file=/var/www/webapp/nome-magnetico/.env',
      env: {
        PORT: 4321,
        HOST: '0.0.0.0',
        NODE_ENV: 'production',
      },
    },
  ],
};