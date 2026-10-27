# 🏦 LipariBank Digital Channels

Backend API per il sistema bancario digitale LipariBank, implementato con Node.js, Express e PostgreSQL. Fornisce un'architettura moderna e scalabile per gestire conti, clienti, trasferimenti e KYC.

## 📚 Stack Tecnologie

- **Runtime**: Node.js 22 (Alpine)
- **Framework**: Express 5.x
- **Database**: PostgreSQL 16 (Alpine)
- **ORM**: Prisma 5.x
- **Testing**: Jest 30.x + Supertest
- **Container**: Docker & Docker Compose
- **Web Server**: Nginx (Reverse Proxy)
- **Documentation**: Swagger/OpenAPI
- **Language**: TypeScript 6.x

## 🚀 Come avviare in locale

### Prerequisiti
- Docker e Docker Compose installati
- Node.js 22+ (opzionale per sviluppo locale)

### Avvio rapido

```bash
# 1. Clona il repository e entra nella cartella
cd liparibank-digital-channels

# 2. Copia il file di configurazione
cp .env.example .env

# 3. Avvia l'intero stack (DB + App + Nginx)
docker compose up --build

# 4. L'app sarà disponibile su http://localhost
```

### In caso di problemi con il database

```bash
# Reset completo (elimina i dati)
docker compose down -v
docker compose up --build
```

## 📋 Endpoint Principali

| Metodo | Endpoint | Auth | Descrizione |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | ❌ | Registra nuovo utente |
| `POST` | `/api/auth/login` | ❌ | Login e issua cookie JWT |
| `POST` | `/api/auth/refresh` | ❌ | Refresh token JWT |
| `POST` | `/api/auth/logout` | ✅ | Logout utente |
| `GET` | `/api/accounts` | ✅ | Lista conti dell'utente |
| `POST` | `/api/accounts` | ✅ | Crea nuovo conto |
| `GET` | `/api/accounts/:id` | ✅ | Dettagli conto |
| `PUT` | `/api/accounts/:id` | ✅ | Aggiorna conto |
| `DELETE` | `/api/accounts/:id` | ✅ | Soft-delete conto |
| `GET` | `/api/customers` | ✅ | Lista clienti |
| `POST` | `/api/customers` | ✅ | Crea nuovo cliente |
| `GET` | `/api/customers/:id` | ✅ | Dettagli cliente |
| `POST` | `/api/customers/:id/kyc` | ✅ | Upload documento KYC |
| `GET` | `/api/customers/:id/kyc` | ✅ | Lista documenti KYC |
| `POST` | `/api/transfers` | ✅ | Crea bonifico |
| `GET` | `/api/transfers` | ✅ | Lista bonifici (cursor pagination) |
| `GET` | `/api/reports/balance-by-customer` | ✅ ADMIN | Report saldi per cliente |
| `GET` | `/api/ai/stream?q=<query>` | ✅ | SSE streaming per AI |
| `GET` | `/api/health` | ❌ | Liveness probe |
| `GET` | `/api/ready` | ❌ | Readiness probe (verifica DB) |

## 📖 Documentazione API

La documentazione Swagger è disponibile a:
```
http://localhost/api-docs
```

Oppure durante lo sviluppo locale:
```
http://localhost:3000/api-docs
```

## 🔐 Flusso Autenticazione

1. **Register**: `POST /api/auth/register` con email e password
2. **Login**: `POST /api/auth/login` → restituisce cookie `refreshToken` (HttpOnly)
3. **Access Token**: Il client riceve automaticamente `accessToken` nei response headers
4. **Refresh**: `POST /api/auth/refresh` quando l'access token scade
5. **Logout**: `POST /api/auth/logout` → revoca il refresh token

**Cookie Security**:
- ✅ HttpOnly (non accessibile da JavaScript)
- ✅ Secure (solo HTTPS in produzione)
- ✅ SameSite=Lax (protezione CSRF)

## 🧪 Test

### Esecuzione test

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run only unit tests
npm run test:unit

# Coverage report
npm run test:coverage
```

### Test di integrazione

I test di integrazione usano un database PostgreSQL in container.

```bash
# Nel CI, il database è fornito da GitHub Actions
npm run test:ci
```

## 🔧 Variabili d'Ambiente

| Variabile | Descrizione | Esempio |
|-----------|-------------|---------|
| `NODE_ENV` | Ambiente (development/production) | `development` |
| `PORT` | Porta del server | `3000` |
| `DATABASE_URL` | Connection string PostgreSQL | `postgresql://user:pass@localhost:5432/liparibank_digital` |
| `CORS_ORIGIN` | Origine CORS permessa | `http://localhost:5173` |
| `JWT_ACCESS_SECRET` | Secret per access token | (generated UUID) |
| `JWT_REFRESH_SECRET` | Secret per refresh token | (generated UUID) |

### Produzione

Per la produzione, assicurati di:
- ✅ Impostare `NODE_ENV=production`
- ✅ Usare `DATABASE_URL` con connection pool
- ✅ Generare nuovi JWT secrets forti
- ✅ Configurare HTTPS + HSTS
- ✅ Usare environment variables sicure (secrets manager)

## 🏗️ Architettura

```
src/
├── app.ts                 # Express app e middleware
├── server.ts              # Entry point con graceful shutdown
├── config/                # Configurazione (env, Prisma, Swagger)
├── middleware/            # Auth, error handling, validation
├── modules/               # Business logic per dominio
│   ├── auth/
│   ├── customer/
│   ├── account/
│   ├── transfer/
│   └── kyc/
├── routes/                # Route definitions
├── services/              # Business logic
├── repositories/          # Database layer
├── types/                 # TypeScript types
└── utils/                 # Helper functions
```

## 🐳 Docker

### Build immagine

```bash
docker build -t liparibank-api:dev .
```

### Dimensione immagine

Target: < 200MB (multi-stage build per ottimizzazione)

```bash
docker image ls liparibank-api:dev
```

## 🔄 CI/CD Pipeline

- **`.github/workflows/ci.yml`**: Full test suite (push + PR)
  - Lint, type check, unit tests, integration tests
  - Build e upload coverage

- **`.github/workflows/pr-check.yml`**: Quick PR validation
  - Lint, type check, unit tests solamente

## ✅ Checklist Pre-Produzione

Vedi `docs/production-checklist.md` per il dettaglio completo di:
- Security headers (Helmet)
- CORS configuration
- Rate limiting
- Connection pooling
- Logging con redaction
- Graceful shutdown
- Health checks
- Backup strategy

## 📦 Package Scripts

```bash
npm run dev                # Development server con hot reload
npm run build              # Compila TypeScript → dist/
npm run start              # Avvia server compilato
npm run lint               # ESLint check
npm run format             # Prettier format
npm run typecheck          # TypeScript type check
npm run prisma:migrate     # Database migration dev
npm run prisma:deploy      # Database migration prod
npm run prisma:generate    # Generate Prisma client
npm run prisma:studio      # Prisma Studio UI
npm run prisma:reset       # Reset database (dev only)
npm test                   # Jest test suite
npm run test:coverage      # Coverage report
npm run test:ci            # CI mode (coverage + no watch)
```

## 🚨 Troubleshooting

### Database connection failed
```bash
# Check if postgres service is running
docker compose ps

# Check logs
docker compose logs db
```

### Port already in use
```bash
# Kill process using port 3000/5432/80
lsof -i :3000
kill -9 <PID>
```

### Migration errors
```bash
# Reset and retry
docker compose down -v
docker compose up --build
```

## 📝 License

ISC

## 👥 Autore

LipariBank Development Team
