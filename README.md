# 🎣 TUCUN — Mapa do Pescador

> Aplicativo de pesca e aventura para Rondônia e Brasil

## 📋 Pré-requisitos

- Node.js v20+
- Docker Desktop
- VS Code
- Git

## 🚀 Início Rápido

### 1. Clonar e instalar dependências
```bash
git clone https://github.com/seu-usuario/tucun.git
cd tucun
cp .env.example .env
# Preencha o .env com suas chaves
npm install
```

### 2. Subir infraestrutura
```bash
docker compose -f infrastructure/docker-compose.yml up -d
```

### 3. Verificar serviços
| Serviço | URL | Usuário | Senha |
|---------|-----|---------|-------|
| pgAdmin | http://localhost:8080 | admin@tucun.app | admin123 |
| Redis UI | http://localhost:8081 | — | — |
| API | http://localhost:3333 | — | — |
| Web | http://localhost:3000 | — | — |

### 4. Iniciar desenvolvimento
```bash
# Todos os apps juntos
npm run dev

# Apenas API
cd apps/api && npm run dev

# Apenas Web
cd apps/web && npm run dev

# Apenas Mobile
cd apps/mobile && npx expo start
```

## 📁 Estrutura do Projeto

```
tucun/
├── apps/
│   ├── mobile/    # React Native + Expo
│   ├── web/       # Next.js 14
│   └── api/       # NestJS
├── packages/
│   ├── shared-types/    # Tipos TypeScript
│   ├── shared-schemas/  # Validações Zod
│   └── shared-utils/    # Funções utilitárias
└── infrastructure/
    └── docker/    # Configs dos containers
```

## 🛠️ Tecnologias

- **Mobile**: React Native + Expo
- **Web**: Next.js 14 (App Router)
- **API**: NestJS + TypeScript
- **Banco**: PostgreSQL + PostGIS
- **Cache**: Redis
- **Mapas**: Mapbox
- **Pagamentos**: Asaas (PIX + Cartão)
- **WhatsApp**: Z-API
- **Storage**: AWS S3
