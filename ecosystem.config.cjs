const dotenv = require('dotenv');
const path = require('path');

// Carrega as variáveis do .env e converte em um objeto
const envConfig = dotenv.config({ path: path.join(__dirname, '.env') }).parsed || {};

module.exports = {
  apps: [
    {
      name: 'nome-magnetico',
      script: './dist/server/entry.mjs',
      instances: 'max',
      exec_mode: 'cluster',
      // Removemos a flag nativa do Node que estava falhando
      env: {
        PORT: 4321,
        HOST: '0.0.0.0',
        NODE_ENV: 'production',
        ...envConfig, // Injeta todas as chaves do seu .env com segurança aqui
      },
    },
  ],
};