import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

pdf(fs.readFileSync('Estrutura relatório Nome do Bebê.pdf')).then(data => {
  console.log('--- START PDF ---');
  console.log(data.text);
  console.log('--- END PDF ---');
}).catch(console.error);
