# 🚀 Manual de Deploy: Nome Magnético na VPS

Este é o guia completo para inicializar a sua máquina virtual (VPS) com Ubuntu/Debian e configurar o deploy contínuo através do GitHub Actions. 

## Passo 1: Preparar a VPS

Conecte-se na sua VPS via SSH como root (ou usuário com privilégios de sudoer).

```bash
ssh root@seu_ip_da_vps
```

Se o git não estiver instalado, instale-o ou envie o script `scripts/setup-vps.sh` para sua VPS. Você pode criar o arquivo direto nela:
```bash
nano /root/setup-vps.sh
```
Cole o conteúdo de `scripts/setup-vps.sh`, salve e execute:
```bash
bash /root/setup-vps.sh
```
Esse comando garantirá que seu servidor tem o Node.js v20, o PM2 global, e criará as pastas estruturais de hospedagem em `/var/www/nomemagnetico`.

### 1.1 Variáveis de Ambiente na VPS
Crie o arquivo `.env` dentro da pasta onde o código vai rodar na VPS com suas credenciais do banco de dados (Supabase, Resend, Stripe, etc).
```bash
nano /var/www/nomemagnetico/.env
```
*(Preencha as variáveis cruciais listadas no ambiente de produção do seu projeto.)*

## Passo 2: Configurar Repositório Git e GitHub
Você precisa que esse painel já esteja dentro de um repositório no GitHub.

Se ainda não fez o commit base na sua máquina local de desenvolvimento:
```bash
git init
git add .
git commit -m "feat: first commit"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/nome-magnetico.git
git push -u origin main
```

## Passo 3: Configurar os "Secrets" do GitHub Actions

Para a pipeline funcionar, o GitHub Actions precisa se logar na sua VPS. Entre no repositório do Github pelo navegador:

1. Vá na aba **Settings** > **Secrets and variables** > **Actions** do seu Repositório.
2. Adicione **New repository secret** exatamente com as chaves abaixo (3 chaves):

- 


## Passo 4: Fazer o Primeiro Deploy

Agora que a pipeline (`.github/workflows/deploy.yml`) existe e as chaves estão conectadas, cada vez que fizer um Push para a branch `main`:

```bash
git add .
git commit -m "chore: test deploy pipeline to vps"
git push origin main
```

Isso ativará a rotina. Vá até a aba "Actions" no GitHub, abra o Workflow e veja os passos sendo executados: instalação de Node 20, compilação de CSS e Código Astro, espelhamento do `dist/` para a VPS através do **Rsync** e por fim um acesso remoto recarregando a aplicação com **PM2**.

Se rodou sem erros, seu site está no ar sob a porta configurada (`4321` por padrão).

## Passo 5: Configurar Nginx e SSL (HTTPS)

Dentro da pasta `scripts/` existe o arquivo `nginx.conf` pronto. Copie este arquivo para o Nginx da sua VPS:

```bash
cp /var/www/nomemagnetico/scripts/nginx.conf /etc/nginx/sites-available/nomemagnetico
```

Ative a configuração e reinicie o servidor web:
```bash
ln -s /etc/nginx/sites-available/nomemagnetico /etc/nginx/sites-enabled/
systemctl reload nginx
```

### Instalar SSL (Certificado de Segurança HTTPS grátis)
Uma vez que o domínio (`nomemagnetico.com.br` e `www.nomemagnetico.com.br`) estiver apontado para o IP da sua VPS no Registro.br ou Cloudflare, rode na VPS:
```bash
sudo apt install python3-certbot-nginx -y
sudo certbot --nginx -d nomemagnetico.com.br -d www.nomemagnetico.com.br
```
O Certbot cuidará sozinho de reescrever seu arquivo do Nginx incluindo o certificado SSL!
