/**
 * PDFFonts — registro das fontes customizadas para @react-pdf/renderer.
 * Deve ser chamado uma vez antes de renderizar qualquer PDF.
 */
import { Font } from '@react-pdf/renderer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

Font.registerHyphenationCallback((word) => [word]);

function loadFont(name: string, filename: string): boolean {
  const candidates = [
    path.resolve(process.cwd(), `public/fonts/${filename}`),
    path.resolve(process.cwd(), `dist/client/fonts/${filename}`),
    path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      `../../../../public/fonts/${filename}`
    ),
    path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      `../../../../dist/client/fonts/${filename}`
    ),
  ];
  for (const p of candidates) {
    try {
      if (!fs.existsSync(p)) continue;
      const buf = fs.readFileSync(p);
      if (buf.length < 12) continue;
      const magic = buf.readUInt32BE(0);
      if (![0x00010000, 0x4f54544f, 0x74746366, 0x74727565].includes(magic)) continue;
      Font.register({ family: name, src: p });
      return true;
    } catch {
      continue;
    }
  }
  return false;
}

const cinzelOk = loadFont('Cinzel', 'Cinzel-Regular.ttf');
const cinzelBoldOk = loadFont('CinzelBold', 'Cinzel-Bold.ttf');
const interOk = loadFont('Inter', 'Inter-Regular.ttf');
const interBoldOk = loadFont('InterBold', 'Inter-Bold.ttf');

export const LOGO_FONT = cinzelOk ? 'Cinzel' : 'Helvetica-Bold';
export const TITLE_FONT = cinzelBoldOk
  ? 'CinzelBold'
  : cinzelOk
    ? 'Cinzel'
    : 'Helvetica-Bold';
export const BODY_FONT = interOk ? 'Inter' : 'Helvetica';
export const BODY_FONT_BOLD = interBoldOk ? 'InterBold' : 'Helvetica-Bold';

/** Tenta carregar o logo como data URI base64 */
export function loadLogoSrc(): string {
  const logoCandidates = [
    path.resolve(process.cwd(), 'public/logo-nome-magnetico.png'),
    path.resolve(process.cwd(), 'dist/client/logo-nome-magnetico.png'),
    path.resolve(process.cwd(), 'src/frontend/assets/logo-nome-magnético-v4.png'),
    path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      '../../../../dist/client/logo-nome-magnetico.png'
    ),
  ];
  for (const p of logoCandidates) {
    try {
      if (!fs.existsSync(p)) continue;
      const buf = fs.readFileSync(p);
      if (buf.length < 1024) continue;
      return `data:image/png;base64,${buf.toString('base64')}`;
    } catch {
      continue;
    }
  }
  return '';
}

/** Helper: carrega um arquivo de public/ ou dist/client/ como base64 data URI */
function tryLoadPngBase64(filename: string): string {
  const candidates = [
    path.resolve(process.cwd(), `public/${filename}`),
    path.resolve(process.cwd(), `dist/client/${filename}`),
    path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      `../../../../dist/client/${filename}`
    ),
    path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      `../../../../public/${filename}`
    ),
  ];
  for (const p of candidates) {
    try {
      if (!fs.existsSync(p)) continue;
      const buf = fs.readFileSync(p);
      if (buf.length < 100) continue;
      return `data:image/png;base64,${buf.toString('base64')}`;
    } catch {
      continue;
    }
  }
  return '';
}

/**
 * Logo da CAPA do PDF — substitui ícone + texto "NOME MAGNETICO" na capa.
 * Carregado uma vez na inicialização do módulo.
 */
export const CAPA_LOGO_SRC = tryLoadPngBase64('logo-nomemagnetico-capa-pdf.png');

/**
 * Logo do HEADER das páginas do PDF — substitui o texto "NOME MAGNETICO" no cabeçalho.
 * Carregado uma vez na inicialização do módulo.
 */
export const HEADER_LOGO_SRC = tryLoadPngBase64('logo-nomemagnetico-header-pdf.png');

/** Formata data string (ISO ou YYYY-MM-DD) para pt-BR */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    if (dateStr.includes('T')) {
      return new Date(dateStr).toLocaleDateString('pt-BR');
    }
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  } catch {
    return dateStr;
  }
}
