export interface GuidePromptParams {
  nomeCompleto: string;
  nomeMagnetico: string;
  numeroExpressaoOriginal: number;
  numeroExpressaoNovo: number;
  bloqueiosRemovidos: string[];
}

export function buildGuidePrompt(params: GuidePromptParams): string {
  const {
    nomeCompleto,
    nomeMagnetico,
    numeroExpressaoOriginal,
    numeroExpressaoNovo,
    bloqueiosRemovidos,
  } = params;

  const bloqueiosTexto =
    bloqueiosRemovidos.length > 0
      ? bloqueiosRemovidos.join(', ')
      : 'todos os bloqueios foram removidos';

  return `## Contexto

${nomeCompleto.split(' ')[0]} decidiu adotar o Nome Magnético **${nomeMagnetico}**.

- Nome original: ${nomeCompleto} (Expressão: ${numeroExpressaoOriginal})
- Nome magnético: ${nomeMagnetico} (Expressão: ${numeroExpressaoNovo})
- Bloqueios removidos: ${bloqueiosTexto}

---

## Sua tarefa

Crie um **Guia de Implementação** prático e inspirador para ${nomeCompleto.split(' ')[0]} adotar o nome ${nomeMagnetico.split(' ')[0]} no dia a dia.

### 1. Ritual de Ativação do Nome
Um ritual simbólico para "ativar" a nova energia do nome (meditação, afirmação, escrita, etc.).

### 2. Plano de Implementação — 30 dias
Divida em 4 semanas:
- **Semana 1:** Apresentação interna (como começar a se ver com o novo nome)
- **Semana 2:** Círculo íntimo (família e amigos próximos)
- **Semana 3:** Expansão (colegas, redes sociais)
- **Semana 4:** Consolidação (documentos, e-mail profissional, etc.)

### 3. Afirmações Personalizadas
5 afirmações poderosas específicas para ${nomeMagnetico.split(' ')[0]}, conectadas à energia dos novos números.

### 4. Práticas de Fixação Energética
3 práticas diárias simples para reforçar a vibração do novo nome.

### 5. Como Lidar com Resistências
Orientação para quando pessoas ao redor resistirem à mudança de nome.

Seja encorajador, prático e mágico — este é um momento de transformação real na vida desta pessoa!

REGRAS OBRIGATÓRIAS DE FORMATAÇÃO:
1. NUNCA use títulos em letras MAIÚSCULAS. Use sempre Hash Headers (## ou ###).
2. Seções principais com "## 🔑 [número]. [Título]" (ou outro emoticon relevante).
3. Use segunda pessoa: "você", "seu", "sua" — fale diretamente com a pessoa pelo nome.
4. SEMPRE duplo espaçamento entre parágrafos.
5. Parágrafos com no máximo 4 linhas.
6. **Atenção ao Uso do Negrito:** Utilize negrito (**) EXCLUSIVAMENTE para referenciar os números e dicas essenciais. O restante do texto NORMAL.`;
}
