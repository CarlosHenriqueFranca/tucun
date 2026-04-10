# 🎣 TUCUN — Aplicativo de Pesca e Aventura

> Plataforma completa para pescadores e aventureiros de Rondônia e Brasil. Mapas colaborativos, gamificação, rede social, WhatsApp OTP e pagamentos PIX.

[![NestJS](https://img.shields.io/badge/NestJS-11-red)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Expo](https://img.shields.io/badge/Expo-52-blue)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+PostGIS-blue)](https://postgis.net/)
[![Redis](https://img.shields.io/badge/Redis-7-red)](https://redis.io/)

---

## 📱 Sobre o Projeto

O **Tucun** é um super-app voltado para pescadores e campistas brasileiros, com:

- 🗺️ **Mapa colaborativo** de pontos de pesca, acampamentos, marinas, postos e mercados
- 📸 **Feed social** estilo Instagram com fotos, vídeos e histórias
- 🏆 **Gamificação** com XP, níveis, badges e ranking (leaderboard)
- 💬 **Chat em tempo real** via WebSocket (Socket.io)
- 📲 **Autenticação WhatsApp** via OTP (Z-API)
- 💳 **Assinaturas** com PIX e cartão de crédito (Asaas)
- 🌿 **Sustentabilidade**: piracema, espécies protegidas, eco-reports
- 🔔 **Notificações push** via Firebase

---

## 🏗️ Arquitetura

```
tucun/                          # Monorepo (Turborepo + npm workspaces)
├── apps/
│   ├── api/                    # NestJS 11 — API REST + WebSocket
│   │   └── src/
│   │       ├── modules/        # Módulos de domínio (DDD + Clean Architecture)
│   │       │   ├── identity/       # Autenticação (JWT, Google, Facebook, WhatsApp)
│   │       │   ├── mapping/        # Pontos, alertas, logs de pesca
│   │       │   ├── social/         # Feed, posts, stories, follows
│   │       │   ├── messaging/      # Chat em tempo real (Socket.io)
│   │       │   ├── gamification/   # XP, badges, leaderboard
│   │       │   ├── commerce/       # Assinaturas e pagamentos (Asaas)
│   │       │   ├── community/      # Sugestões colaborativas
│   │       │   ├── sustainability/ # Espécies, piracema, eco-reports
│   │       │   ├── notifications/  # Push (Firebase) + FCM tokens
│   │       │   └── health/         # Health check (DB + Redis)
│   │       ├── shared/         # Guards, decorators, pipes, utils
│   │       ├── config/         # Variáveis de ambiente tipadas
│   │       └── database/       # Migrations TypeORM
│   ├── web/                    # Next.js 14 (App Router)
│   │   └── app/
│   │       ├── page.tsx            # Landing page (PT-BR)
│   │       └── assinar/            # Checkout de assinatura
│   └── mobile/                 # React Native + Expo 52
│       └── app/
│           ├── (tabs)/             # 4 abas: Mapa, Feed, Perfil, Chat
│           └── (auth)/             # Login, Registro, OTP WhatsApp
├── packages/
│   ├── shared-types/           # Tipos TypeScript compartilhados
│   ├── shared-schemas/         # Validações Zod
│   └── shared-utils/           # Funções utilitárias
└── infrastructure/
    └── docker/                 # Docker Compose (Postgres+PostGIS, Redis, pgAdmin, Nginx)
```

### Padrões Arquiteturais

| Camada | Responsabilidade |
|--------|-----------------|
| **Domain** | Entidades, value objects, interfaces de repositório |
| **Application** | Use cases, DTOs, services de aplicação |
| **Infrastructure** | ORM entities, repositórios, strategies, gateways |
| **Presentation** | Controllers REST, WebSocket gateway |

---

## 🚀 Início Rápido

### Pré-requisitos

- Node.js v20+
- Docker Desktop
- Git

### 1. Clonar e instalar

```bash
git clone https://github.com/seu-usuario/tucun.git
cd tucun
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp apps/api/.env.example apps/api/.env
# Edite o .env com suas chaves
```

### 3. Subir infraestrutura Docker

```bash
# Usando docker-compose (infra: Postgres+PostGIS, Redis, pgAdmin, Nginx)
cd infrastructure
docker compose up -d

# Verificar containers
docker compose ps
```

### 4. Iniciar a API

```bash
cd apps/api
npm run start:dev
# API disponível em http://localhost:3333
# Swagger em http://localhost:3333/api/docs
```

### 5. Iniciar o Web (opcional)

```bash
cd apps/web
npm run dev
# Web disponível em http://localhost:3000
```

### 6. Iniciar o Mobile (opcional)

```bash
cd apps/mobile
npm install
npx expo start
```

---

## 🔧 Serviços de Desenvolvimento

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| **API** | http://localhost:3333/api | — |
| **Swagger UI** | http://localhost:3333/api/docs | — |
| **Web** | http://localhost:3000 | — |
| **pgAdmin** | http://localhost:8080 | admin@tucun.app / admin123 |
| **Redis UI** | http://localhost:8081 | — |
| **Nginx** | http://localhost:80 | — |

---

## 📡 Endpoints da API

### Autenticação (`/api/auth`)
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/register` | Criar conta (email/senha) |
| POST | `/auth/login` | Login com email/senha |
| POST | `/auth/refresh` | Renovar access token |
| POST | `/auth/logout` | Invalidar tokens |
| GET | `/auth/google` | OAuth2 Google |
| GET | `/auth/facebook` | OAuth2 Facebook |
| POST | `/auth/whatsapp/otp` | Enviar OTP via WhatsApp |
| POST | `/auth/whatsapp/verify` | Verificar OTP WhatsApp |

### Usuários (`/api/users`)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/users/me` | Perfil do usuário atual |
| PATCH | `/users/me` | Atualizar perfil |
| GET | `/users/:username` | Perfil público |

### Mapa (`/api/spots`, `/api/alerts`, `/api/fish-logs`)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/spots/nearby?latitude=&longitude=&radius=` | Pontos próximos (PostGIS) |
| POST | `/spots` | Criar ponto (requer assinatura) |
| GET | `/spots/:id` | Detalhes do ponto |
| POST | `/spots/:id/rate` | Avaliar ponto |
| GET | `/alerts/nearby?lat=&lng=&radius=` | Alertas próximos |
| POST | `/alerts` | Criar alerta |
| POST | `/fish-logs` | Registrar pescaria (ganha XP) |
| GET | `/fish-logs` | Meu histórico de pescas |
| GET | `/fish-logs/stats` | Minhas estatísticas |

### Social (`/api/feed`, `/api/posts`, `/api/stories`)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/feed` | Feed personalizado |
| POST | `/posts` | Criar post com mídia |
| GET | `/posts/:id` | Ver post |
| POST | `/posts/:id/like` | Curtir/descurtir |
| POST | `/posts/:id/comments` | Comentar |
| GET | `/stories` | Ver stories |
| POST | `/stories` | Criar story |
| POST | `/upload/image` | Upload de imagem |

### Gamificação (`/api/gamification`)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/gamification/leaderboard` | Ranking global |
| GET | `/gamification/badges` | Todos os badges |
| GET | `/gamification/my-badges` | Meus badges |
| GET | `/gamification/xp-history` | Histórico de XP |

### Sustentabilidade (`/api/fish`, `/api/piracema`, `/api/eco-reports`)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/fish` | Lista de espécies |
| GET | `/fish/:id` | Detalhes da espécie |
| GET | `/piracema` | Períodos de piracema |
| GET | `/piracema/calendar` | Calendário de piracema |
| POST | `/eco-reports` | Reportar problema ambiental |
| GET | `/eco-reports` | Lista de eco-reports |

### Assinaturas (`/api/subscriptions`)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/subscriptions/plans` | Planos disponíveis |
| GET | `/subscriptions/my` | Minha assinatura |
| POST | `/subscriptions` | Assinar plano |
| POST | `/subscriptions/cancel` | Cancelar assinatura |
| GET | `/subscriptions/payments` | Histórico de pagamentos |

### Mensagens (`/api/conversations`)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/conversations` | Minhas conversas |
| POST | `/conversations` | Nova conversa |
| GET | `/conversations/:id/messages` | Mensagens |
| POST | `/conversations/:id/messages` | Enviar mensagem |

### Chat em Tempo Real (WebSocket)
- **Namespace**: `ws://localhost:3333/chat`
- **Eventos**: `join_conversation`, `send_message`, `message_received`, `user_typing`

---

## ⚙️ Variáveis de Ambiente

Crie `apps/api/.env` com as seguintes chaves:

```env
# Aplicação
NODE_ENV=development
PORT=3333

# Banco de Dados
DATABASE_URL=postgresql://tucun:tucun_dev_password@localhost:5432/tucun

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=tucun_redis_dev

# JWT
JWT_ACCESS_SECRET=seu_secret_aqui_minimo_64_caracteres
JWT_REFRESH_SECRET=seu_secret_aqui_minimo_64_caracteres
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# OAuth (opcional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=

# WhatsApp OTP via Z-API (opcional)
ZAPI_INSTANCE_ID=
ZAPI_TOKEN=
ZAPI_CLIENT_TOKEN=

# Asaas Pagamentos (opcional)
ASAAS_API_KEY=
ASAAS_ENVIRONMENT=sandbox

# AWS S3 (opcional)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_S3_BUCKET=

# Firebase Push (opcional)
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# Mapbox (frontend)
NEXT_PUBLIC_MAPBOX_TOKEN=
```

---

## 🧪 Testando a API

```bash
# Health check
curl http://localhost:3333/api/health

# Registrar usuário
curl -X POST http://localhost:3333/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"João","username":"joao","email":"joao@email.com","password":"Senha@123"}'

# Login
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@email.com","password":"Senha@123"}'

# Usar token retornado
TOKEN="seu_token_aqui"

# Ver perfil
curl http://localhost:3333/api/users/me \
  -H "Authorization: Bearer $TOKEN"

# Buscar pontos próximos
curl "http://localhost:3333/api/spots/nearby?latitude=-2.5297&longitude=-44.2967&radius=500000"

# Ver ranking
curl http://localhost:3333/api/gamification/leaderboard
```

---

## 🏆 Sistema de Gamificação

### Ganho de XP

| Ação | XP |
|------|----|
| Registrar pescaria | +30 XP |
| Primeira pescaria da espécie | +50 XP |
| Criar ponto no mapa | +20 XP |
| Fazer check-in em ponto | +10 XP |
| Publicar post | +5 XP |
| Receber like | +2 XP |
| Eco-report aprovado | +25 XP |

### Níveis

| Nível | Nome | XP Necessário |
|-------|------|---------------|
| 1 | Iniciante | 0 |
| 2 | Aprendiz | 500 |
| 3 | Pescador | 1.500 |
| 4 | Explorador | 3.500 |
| 5 | Desbravador | 7.500 |
| 6 | Veterano | 15.000 |
| 7 | Mestre | 30.000 |
| 8 | Lenda | 55.000 |
| 9 | Grande Mestre | 90.000 |
| 10 | Tucunaré Lenda | 150.000 |

---

## 💳 Planos de Assinatura

| Plano | Preço | Benefícios |
|-------|-------|------------|
| **Free** | Grátis | Mapa básico, 10 logs/mês |
| **Pro** | R$ 14,90/mês | Criar pontos, logs ilimitados, sem anúncios |
| **Premium** | R$ 29,90/mês | Tudo do Pro + chat, analytics, suporte prioritário |

> **Trial**: 7 dias grátis no plano Pro para novos usuários

---

## 🛠️ Tecnologias

### Backend (API)
- **NestJS 11** — Framework Node.js com decorators
- **TypeORM 0.3** — ORM com PostgreSQL
- **PostgreSQL 16 + PostGIS** — Banco geoespacial
- **Redis 7** — Cache e sessões
- **Socket.io** — WebSocket para chat em tempo real
- **Passport.js** — Autenticação (JWT, Google, Facebook)
- **BullMQ** — Filas de processamento assíncrono
- **Firebase Admin** — Push notifications
- **Asaas SDK** — Pagamentos brasileiros (PIX + cartão)
- **Z-API** — WhatsApp OTP

### Frontend Web
- **Next.js 14** — App Router, Server Components
- **TypeScript** — Tipagem estática
- **Tailwind CSS** — Estilização utilitária

### Mobile
- **Expo 52** — Framework React Native
- **Expo Router** — Navegação file-based
- **NativeWind** — Tailwind CSS para React Native
- **Zustand** — Gerenciamento de estado
- **TanStack Query** — Cache e sincronização de dados
- **Mapbox** — Mapas interativos
- **expo-secure-store** — Armazenamento seguro de tokens

---

## 🐳 Docker Compose

```yaml
# Serviços disponíveis:
# - tucun_postgres  → PostgreSQL 16 + PostGIS 3.4 (porta 5432)
# - tucun_redis     → Redis 7 Alpine (porta 6379)
# - tucun_pgadmin   → Interface web para PostgreSQL (porta 8080)
# - tucun_redis_ui  → Redis Commander (porta 8081)
# - tucun_nginx     → Reverse proxy (porta 80)
```

```bash
# Subir todos os serviços
docker compose -f infrastructure/docker/docker-compose.yml up -d

# Ver logs
docker compose -f infrastructure/docker/docker-compose.yml logs -f api

# Parar tudo
docker compose -f infrastructure/docker/docker-compose.yml down
```

---

## 📂 Módulos de Domínio

### Identity Module
- Registro e login (email/senha, Google OAuth, Facebook OAuth)
- Autenticação via WhatsApp OTP (Z-API)
- JWT Access Token (15min) + Refresh Token (30 dias)
- Rate limiting por IP (Throttler)

### Mapping Module
- Criação e busca de pontos geoespaciais (PostGIS ST_DWithin)
- Tipos: pesca, acampamento, marina, posto, mercado, hospital, polícia, hotel
- Sistema de avaliação por estrelas com média automática
- Alertas comunitários (barreira, poluição, incêndio, etc.)
- Registro de pescarias com XP automático

### Social Module
- Feed cronológico com paginação
- Posts com mídia (imagem/vídeo) + localização + espécie pescada
- Sistema de curtidas e comentários aninhados
- Stories com expiração de 24h
- Sistema de seguidores (follow/unfollow)
- Upload de mídia (S3 ou local em dev)

### Messaging Module
- Conversas 1:1 e em grupo
- Mensagens de texto, imagem, vídeo, áudio e localização
- Leitura em tempo real via WebSocket (Socket.io)
- Indicador de digitação

### Gamification Module
- Sistema de XP com eventos (EventEmitter2)
- Badges automáticos por conquistas
- Leaderboard global com badges
- 10 níveis com nomes temáticos

### Commerce Module
- Planos Free/Pro/Premium
- Integração Asaas (PIX + cartão + parcelamento)
- Trial de 7 dias
- Webhook para confirmação de pagamento

### Community Module
- Sugestões de melhorias com votação
- Categorias: app, conteúdo, mapa, funcionalidade, parceria, outro

### Sustainability Module
- Catálogo de espécies com dados biológicos
- Calendário de piracema por região
- Eco-reports para denúncias ambientais

### Notifications Module
- Push notifications via Firebase Cloud Messaging
- Persistência de notificações no banco
- Gestão de tokens FCM por dispositivo

---

## 🤝 Contribuindo

1. Fork o repositório
2. Crie uma branch: `git checkout -b feature/minha-feature`
3. Commit suas mudanças: `git commit -m 'feat: adiciona minha feature'`
4. Push para a branch: `git push origin feature/minha-feature`
5. Abra um Pull Request

---

## 📄 Licença

MIT © 2024 Tucun App

---

*Feito com ❤️ para pescadores brasileiros* 🎣
