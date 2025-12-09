#!/bin/bash

# Exit on error
set -e

echo "🚀 Iniciando Configuração do Servidor VPS..."

# 1. Update System
echo "📦 Atualizando sistema..."
sudo apt-get update && sudo apt-get upgrade -y

# 2. Install Essentials
echo "🛠️ Instalando ferramentas essenciais (Git, Curl)..."
sudo apt-get install -y git curl apt-transport-https ca-certificates software-properties-common

# 3. Install Docker
echo "🐳 Instalando Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "✅ Docker instalado com sucesso!"
else
    echo "✅ Docker já está instalado."
fi

# 4. Enable Docker Service
sudo systemctl enable docker
sudo systemctl start docker

echo "✅ Configuração Finalizada! O servidor está pronto para rodar o Delivery Master."
echo "👉 Próximo passo: Clone seu repositório e rode 'docker compose -f docker-compose.prod.yml up -d --build'"
