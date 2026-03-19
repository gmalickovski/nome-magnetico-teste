import dotenv from 'dotenv';

// 1. Roda a função e carrega as 22 variáveis na memória PRIMEIRO
dotenv.config({ path: '/var/www/webapp/nome-magnetico/.env' });

// 2. SÓ DEPOIS que o ambiente está pronto, "chama" o Astro dinamicamente
import('./dist/server/entry.mjs');