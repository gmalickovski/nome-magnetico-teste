#!/bin/bash
# -----------------------------------------------------------------------------
# Script de Instalação Zero - Nome Magnético (VPS Ubuntu/Debian)
# Executar como ROOT: sudo bash setup-vps.sh
# -----------------------------------------------------------------------------

set -e

APP_DIR="/var/www/nomemagnetico"
NODE_VERSION="20"

echo "================================================="
echo "Iniciando Setup da VPS para Nome Magnético..."
echo "================================================="

# 1. Atualizar o sistema
echo "-> Atualizando pacotes do sistema..."
apt-get update && apt-get upgrade -y

# 2. Instalar dependências básicas
echo "-> Instalando dependências (curl, git, build-essential)..."
apt-get install -y curl git build-essential rsync nginx

# 3. Instalar Node.js
echo "-> Instalando Node.js v${NODE_VERSION}..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt-get install -y nodejs

# 4. Instalar PM2 globalmente
echo "-> Instalando PM2..."
npm install -g pm2

# 5. Criar diretório da aplicação
echo "-> Criando diretório raiz da aplicação em ${APP_DIR}..."
mkdir -p ${APP_DIR}
chown -R $USER:$USER ${APP_DIR}
chmod -R 755 /var/www/nomemagnetico

# 6. PM2 Startup (Garante que o app inicie com o servidor)
echo "-> Configurando PM2 para inicializar com o servidor..."
env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME || true

echo "================================================="
echo "✅ Setup Base Concluído!"
echo " "
echo "Próximos passos:"
echo "1. Configure seu banco de dados Supabase e variáveis de ambiente localmente (.env)."
echo "2. Inicialize o repositório Git na sua máquina, se ainda não o fez, e suba para o GitHub."
echo "   (Siga as instruções do arquivo DEPLOY.md)"
echo "3. Crie os actions secrets no GitHub (HOST, USERNAME, SSH_PRIVATE_KEY)."
echo "4. Rode a pipeline do GitHub Actions para fazer o primeiro deploy!"
echo "================================================="
