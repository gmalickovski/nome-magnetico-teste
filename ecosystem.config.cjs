const fs = require('fs');

const envPath = '/var/www/webapp/nome-magnetico/.env';
const envVars = {};

// 1. Lê o arquivo .env nativamente sem depender de pacotes externos
try {
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      // Ignora linhas vazias e comentários
      if (line.trim().startsWith('#') || !line.includes('=')) return;

      const parts = line.split('=');
      const key = parts[0].trim();
      // Garante que valores com "=" no meio (como base64 ou chaves de API) não sejam cortados
      let value = parts.slice(1).join('=').trim();

      // Remove aspas simples ou duplas, se houver
      value = value.replace(/(^['"]|['"]$)/g, '');
      envVars[key] = value;
    });
  }
} catch (e) {
  console.error("Erro crítico ao ler o .env nativamente:", e);
}

// 2. Inicia o app forçando as variáveis lidas diretamente no ambiente
module.exports = {
  apps: [
    {
      name: 'nome-magnetico',
      script: './dist/server/entry.mjs',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        PORT: 4321,
        HOST: '0.0.0.0',
        NODE_ENV: 'production',
        ...envVars
      },
    },
  ],
};