module.exports = {
  apps: [
    {
      name: 'nome-magnetico',
      script: './start.mjs', // Apontando para o injetor
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        PORT: 4321,
        HOST: '0.0.0.0',
        NODE_ENV: 'production',
      },
    },
  ],
};