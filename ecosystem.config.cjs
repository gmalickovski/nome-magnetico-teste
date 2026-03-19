const dotenv = require('dotenv');

// Carrega o .env usando o caminho absoluto garantido da sua VPS
const envConfig = dotenv.config({ path: '/var/www/webapp/nome-magnetico/.env' }).parsed || {};

module.exports = {
  apps: [
    {
      name: 'nome-magnetico',
      script: './dist/server/entry.mjs',
      instances: 'max',
      exec_mode: 'cluster',
      // Passa as variáveis explicitamente para o ambiente de produção
      env_production: {
        PORT: 4321,
        HOST: '0.0.0.0',
        NODE_ENV: 'production',
        ...envConfig,
      },
    },
  ],
};