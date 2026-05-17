# Segurança da VPS e Cloudflare

Como o tráfego do Nome Magnético passa pelo Cloudflare, é fundamental garantir que requisições bypass (ataques diretos ao IP do servidor) sejam negadas.

Abaixo estão as instruções para o gerenciador de infraestrutura ou para serem adicionadas aos scripts de setup (`scripts/setup-vps.sh`).

## 1. Configuração do Firewall (UFW) na VPS

No Ubuntu da VPS, o UFW deve ser configurado para aceitar tráfego HTTPS (porta 443) e HTTP (porta 80) **apenas** dos IPs oficiais do Cloudflare.

Você pode criar ou rodar o seguinte script para configurar o UFW automaticamente:

```bash
#!/bin/bash
# Script para configurar o UFW para aceitar tráfego apenas do Cloudflare

# 1. Obter listas de IPs do Cloudflare
echo "Baixando lista de IPs do Cloudflare..."
curl -s https://www.cloudflare.com/ips-v4 -o /tmp/cf_ips
curl -s https://www.cloudflare.com/ips-v6 >> /tmp/cf_ips

# 2. Resetar regras de HTTP/HTTPS no UFW
ufw delete allow http
ufw delete allow https

# 3. Permitir IPs do Cloudflare no UFW
echo "Aplicando regras no UFW..."
for ip in `cat /tmp/cf_ips`; do
  ufw allow from $ip to any port 80
  ufw allow from $ip to any port 443
done

# 4. Negar acesso geral nas portas 80 e 443 (opcional, se o default já for deny)
ufw deny 80
ufw deny 443

# 5. Recarregar UFW
ufw reload

echo "UFW atualizado com sucesso com os IPs do Cloudflare."
```

## 2. Configuração do Nginx (`scripts/nginx.conf`)

No bloco `server` do seu Nginx, é recomendado garantir que os IPs reais dos usuários sejam restaurados, visto que as requisições chegam via Cloudflare.

Adicione o seguinte ao arquivo de configuração (ou inclua um snippet):

```nginx
# Restaurar IPs Reais do Cloudflare
set_real_ip_from 173.245.48.0/20;
set_real_ip_from 103.21.244.0/22;
set_real_ip_from 103.22.200.0/22;
set_real_ip_from 103.31.4.0/22;
set_real_ip_from 141.101.64.0/18;
set_real_ip_from 108.162.192.0/18;
set_real_ip_from 190.93.240.0/20;
set_real_ip_from 188.114.96.0/20;
set_real_ip_from 197.234.240.0/22;
set_real_ip_from 198.41.128.0/17;
set_real_ip_from 162.158.0.0/15;
set_real_ip_from 104.16.0.0/13;
set_real_ip_from 104.24.0.0/14;
set_real_ip_from 172.64.0.0/13;
set_real_ip_from 131.0.72.0/22;

real_ip_header CF-Connecting-IP;
```

## 3. Regras no WAF do Cloudflare

No painel do Cloudflare (Security > WAF > Custom rules), crie as seguintes regras:

1. **Bloquear Threat Scores Altas:**
   - Campo: `Threat Score`
   - Operador: `greater than or equal to`
   - Valor: `50`
   - Ação: `Block` (ou `Managed Challenge`)

2. **Proteger Rotas Sensíveis (Ex: `/api/auth/*`):**
   - Regra para permitir apenas tráfego confiável (por exemplo, do seu próprio domínio ou de IPs conhecidos) em rotas críticas, ou pelo menos exigir desafio (Challenge) para acessos suspeitos nessas rotas.
   - Campo: `URI Path`
   - Operador: `starts with`
   - Valor: `/api/auth/`
   - E (AND) Campo: `Threat Score` > `10` -> Ação: `Managed Challenge`
