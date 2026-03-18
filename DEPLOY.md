# 🚀 Manual de Deploy: Nome Magnético na VPS

Este é o guia completo atualizado para inicializar a sua máquina virtual (VPS) com Ubuntu/Debian e manter o deploy contínuo através do GitHub Actions. 

## Passo 1: Preparar a VPS pela Primeira Vez

Conecte-se na sua VPS via SSH como root.

```bash
ssh root@103.199.185.152
```

Caso seja um servidor virgem, copie e cole o instanciador `setup-vps.sh` da sua pasta `scripts/` direto nele:
```bash
nano /root/setup-vps.sh
```
*(Cole o conteúdo)*, depois salve e execute:
```bash
bash /root/setup-vps.sh
```
Esse comando garantirá que seu servidor tem o Node.js v20, o PM2 global, ferramentas Nginx e criará as pastas estruturais de hospedagem permanentemente em `/var/www/nomemagnetico`.

### 1.1 Variáveis de Ambiente na VPS
Com o diretório base criado e pronto, não esqueça de criar o arquivo `.env` definitivo do servidor (as chaves que acessarão seu Banco Supabase, Stripe etc):
```bash
nano /var/www/nomemagnetico/.env
```

## Passo 2: Configurar os "Secrets" do GitHub Actions

Para o script `.github/workflows/deploy.yml` que acabamos de configurar rodar 100% funcional na internet conectando na sua máquina, vá ao painel de configurações para guardar as informações de forma criptografada.

1. Acesse o Repositório no Github pelo seu navegador.
2. Vá na aba **Settings** > **Secrets and variables** > **Actions**.
3. Escolha **New repository secret**.

- **Name**: `SSH_PRIVATE_KEY`
- **Secret**: Insira todo o conteúdo bruto daquela sua chave (desde o `-----BEGIN OPENSSH PRIVATE KEY-----` até a última letra do `END OPENSSH...`).

*Nota: Host, IPs, Caminhos e Configuração NPM já estão parametrizadas e preenchidas (hardcoded) no próprio arquivo Action, então a pipeline irá sempre atirar diretamente para `103.199.185.152` usando o portão `root`.*

## Passo 3: O Fluxo de Deploy

Sempre que a sua aplicação rodar e a branch `main` receber códigos novos (via comandos como os listados abaixo)
```bash
git add .
git commit -m "Nova feature gerada"
git push origin main
```
Uma nuvem do GitHub pegará a ação para compilação (Build) completa e instalará os arquivos em produção, incluindo a reativação do PM2 invisível ao público debaixo do Node de Produção SSR.

## Passo 4: Configurar Nginx e SSL (HTTPS)

Para publicar de vez na internet o servidor Astro e mascará-lo profissionalmente no Google:

Dentro da pasta que é recebida pelo GitHub Actions, criamos o arquivo `scripts/nginx.conf`. Você apenas entra no SSH da VPS e copia para configurar os diretórios web do servidor local Nginx:

```bash
cp /var/www/nomemagnetico/scripts/nginx.conf /etc/nginx/sites-available/nomemagnetico.com.br
```

Ative a configuração e verifique a recarga:
```bash
ln -s /etc/nginx/sites-available/nomemagnetico.com.br /etc/nginx/sites-enabled/
systemctl reload nginx
```

### Instalar Certificado SSL (HTTPS Seguros e Grátis)
Sabendo que o seu Registro `.com.br` já direciona a Tabela A ao IP `103.199.185.152`, podemos autenticar e ganhar o cadeadinho nos navegadores rodando um software grátis de certificado global:

```bash
sudo apt install python3-certbot-nginx -y
sudo certbot --nginx -d nomemagnetico.com.br -d www.nomemagnetico.com.br
```

Dê apenas os simples 'Enter' ou 'Yes' se perguntarem seu e-mail, e ao fim o software reescreverá o NGINX fechando o ambiente web do Nome Magnético em tráfego criptografado SSL 443!
