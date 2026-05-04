# CODEX.md

Base rapida para Codex neste projeto.

- Leia `AGENTS.md` primeiro.
- Use `CLAUDE.md` como referencia canonica completa.
- Preserve o fluxo atual do usuario: sem PR por enquanto, trabalho direto na `main`, com testes antes de deploy.
- Comandos principais: `npm run dev`, `npx astro check`, `npm run build`, `npm run preview`.
- Deploy so acontece por tag semver `v*.*.*`; consulte `DEPLOY.md` antes de acionar.
- Nao importar `src/backend/` em componentes React.
- Validar endpoints com Zod.
- Toda chamada de IA passa pelo LoopGuard.
- Toda analise numerologica usa os 4 triangulos.
- Nunca mencionar radiestesia/pendulo no produto.
- Nunca usar "Astro" como marca, copy ou nome funcional do produto.
- Documentar novos processos/componentes/decisoes em `docs/architecture/`, `docs/sops/`, `docs/snippets/` ou `docs/devops/`.

Para detalhes operacionais, a fonte de verdade para agentes e `AGENTS.md`.
