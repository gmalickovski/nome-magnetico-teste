# Changelog Técnico: Refinamento Estrutural e Visual do PDF Nome Social

## Resumo
Integração de motor de quebra forçada (##) no PDFMarkdownRenderer para injeção robusta dos Triângulos e Bloqueios; padronização de fontes/espaçamentos e novos layouts dinâmicos para Isenção e Antídotos.

## Arquivos Alterados
- `src/frontend/components/pdf/NomeSocialPDF.tsx`
- `src/frontend/components/pdf/shared/PDFMarkdownRenderer.tsx`
- `src/utils/textFormatter.ts`

## Detalhamento
1. **Blindagem de Injeções no Markdown (PDFMarkdownRenderer.tsx):** 
   Criado um override interno direto no motor de split do React-PDF que empurra duplas quebras de linha (`\n\n`) ao redor de caracteres `#`, prevenindo que a IA junte cabeçalhos à estrutura da página. Resolvido o sumiço dos triângulos causados por `\r`.
2. **Estilização de Subtítulos Personalizados:**
   As strings geradas sem os delimitadores da injeção nativa perderam a marcação `**` graças à purificação regex `replace(/\*\*/g, '')` antes do parse de header H3.
3. **Card Dinâmico de Antídoto Energético:**
   Implementada escuta do título "Bloqueio" em headings H3 para agrupar o título e o bullet seguinte dentro de um Card Dark isolado (fundo #292524, texto Damasco claro), ignorando o layout text normal, conferindo estética perigo-transmutação.
4. **Fallback Zero Bloqueios:**
   Embutida seção condicional `{bloqueios.length === 0}` com container Verde, celebrando o "Fluxo Livre Magnético" antes invisível à jornada do usuário.
5. **Polimento Tipográfico:**
   Fontes Kármicas (`13pt`), Introdução (`10.5pt`) ajustadas. Espaçamentos `marginTop` abolidos de blocos adjacentes para harmonia vertical dos quadros.

## Áreas
`frontend`, `pdf`, `ai`
