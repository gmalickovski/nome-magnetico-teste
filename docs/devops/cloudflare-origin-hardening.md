# Cloudflare e blindagem da origem

## Objetivo

Colocar o Cloudflare na frente do Nome Magnetico e impedir acesso direto ao IP da VPS nas portas web.

## Fluxo

1. Adicionar `nomemagnetico.com.br` ao Cloudflare.
2. Trocar os nameservers no Registro.br pelos informados pelo Cloudflare.
3. No DNS do Cloudflare, manter os registros `A` de `nomemagnetico.com.br` e `www` com proxy ativo.
4. Na VPS, rodar como `root`:

```bash
bash scripts/configure-cloudflare-origin.sh
```

O script baixa as faixas oficiais atuais do Cloudflare, cria `/etc/nginx/snippets/cloudflare-realip.conf`, permite `80/443` somente para essas faixas no UFW, nega o restante e recarrega o Nginx.

## Regras recomendadas no Cloudflare

- Ativar Managed Rules do WAF.
- Criar regra customizada para aplicar `Managed Challenge` ou `Block` a trafego claramente malicioso conforme os sinais disponiveis no plano.
- Proteger rotas sensiveis como `/api/auth/*` e `/api/analyze-live` com rate limiting e, quando fizer sentido, `Managed Challenge`.

## Observacoes

- As faixas do Cloudflare mudam com o tempo; rode novamente `scripts/configure-cloudflare-origin.sh` sempre que o Cloudflare publicar alteracoes.
- Antes de fechar o acesso direto, confirme que todos os registros HTTP publicos estao realmente com proxy ativo.
- Se houver webhook externo que precise falar direto com a origem, documente a excecao e restrinja por IP antes de liberar.
