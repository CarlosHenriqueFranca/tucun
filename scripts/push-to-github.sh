#!/bin/bash
# ============================================================
# TUCUN — Script para publicar no GitHub
# Execute este script para criar o repositório e fazer push
# ============================================================

set -e

echo "🎣 TUCUN — Publicando no GitHub"
echo "================================"
echo ""

# Verificar se o gh está instalado
GH_BIN="/tmp/gh_2.89.0_macOS_arm64/bin/gh"
if ! command -v gh &>/dev/null && [ ! -f "$GH_BIN" ]; then
  echo "📦 Baixando GitHub CLI..."
  curl -sL "https://github.com/cli/cli/releases/download/v2.89.0/gh_2.89.0_macOS_arm64.zip" -o /tmp/gh.zip
  unzip -q /tmp/gh.zip -d /tmp/
  GH="$GH_BIN"
else
  GH=$(command -v gh || echo "$GH_BIN")
fi

echo "✅ GitHub CLI: $GH"
echo ""

# Verificar autenticação
if ! $GH auth status &>/dev/null; then
  echo "🔐 Você precisa fazer login no GitHub."
  echo ""
  echo "Opção 1 — Login interativo (abre o navegador):"
  echo "  $GH auth login"
  echo ""
  echo "Opção 2 — Usar Personal Access Token:"
  echo "  export GITHUB_TOKEN=seu_token_aqui"
  echo "  $GH auth login --with-token <<< \$GITHUB_TOKEN"
  echo ""
  echo "Depois de autenticar, rode este script novamente."
  exit 1
fi

echo "✅ Autenticado no GitHub"

# Obter username
GITHUB_USER=$($GH api user --jq '.login')
echo "👤 Usuário: $GITHUB_USER"
echo ""

# Verificar se o repositório já existe
REPO_NAME="tucun"
if $GH repo view "$GITHUB_USER/$REPO_NAME" &>/dev/null; then
  echo "📁 Repositório $GITHUB_USER/$REPO_NAME já existe."
else
  echo "📁 Criando repositório $REPO_NAME..."
  $GH repo create "$REPO_NAME" \
    --description "🎣 Aplicativo de pesca e aventura — Mapa colaborativo, gamificação, rede social, PIX" \
    --public \
    --homepage "https://tucun.app"
  echo "✅ Repositório criado!"
fi

echo ""
echo "🔗 Configurando remote..."
cd "$(dirname "$0")/.."

# Adicionar ou atualizar remote
if git remote get-url origin &>/dev/null; then
  git remote set-url origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"
else
  git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"
fi

echo "⬆️  Fazendo push para o GitHub..."
git push -u origin main --force

echo ""
echo "✅ Publicado com sucesso!"
echo "🔗 https://github.com/$GITHUB_USER/$REPO_NAME"
echo ""

# Configurar tópicos do repositório
echo "🏷️  Configurando tópicos..."
$GH repo edit "$GITHUB_USER/$REPO_NAME" \
  --add-topic "nestjs" \
  --add-topic "nextjs" \
  --add-topic "expo" \
  --add-topic "typescript" \
  --add-topic "postgresql" \
  --add-topic "postgis" \
  --add-topic "fishing-app" \
  --add-topic "brazil" \
  --add-topic "turborepo" \
  --add-topic "react-native" 2>/dev/null || true

echo "✅ Tópicos configurados!"
echo ""
echo "🎣 TUCUN está no GitHub! Acesse:"
echo "   https://github.com/$GITHUB_USER/$REPO_NAME"
