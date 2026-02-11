# Project Yum — Recipe App

A full-stack recipe application built as a learning template for scalable, multi-tenant backend architecture. Built with Angular, Node/Express, MongoDB, Docker and Nginx.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 11 |
| Backend | Node.js / Express |
| Database | MongoDB |
| Reverse Proxy / Load Balancer | Nginx |
| Containerisation | Docker + Docker Compose |

---

## Architecture

```
localhost:80
      ↓
   Nginx (reverse proxy + load balancer)
   ↓                         ↓
/api                         /
   ↓                         ↓
Backend (x3 replicas)    Frontend (Angular)
   ↓
MongoDB
```

---

## Prerequisites

- Docker Desktop installed and running
- That's it — no Node, MongoDB or Nginx needed locally

---

## Getting Started

### 1. Clone the repo

```bash
git clone <repo-url>
cd practise-one
```

### 2. Set up environment files

Copy the example env file and fill in your values:

```bash
cp backend/config/.env.example backend/config/.env.dev
cp backend/config/.env.example backend/config/.env.test
cp backend/config/.env.example backend/config/.env.prod
```

### 3. Build the images

```bash
docker-compose build
```

### 4. Start the app (dev)

```bash
docker-compose up
```

With load balancing (3 backend instances):

```bash
docker-compose up --scale backend=3
```

### 5. Access

| Service | URL |
|---|---|
| Frontend | http://localhost:4200 |
| Backend API | http://localhost:80/api |
| MongoDB (Compass) | mongodb://localhost:27017 |

### 6. Stop

```bash
docker-compose down
```

---

## Docker Compose Files

| File | Environment | Mongo | Dockerfiles |
|---|---|---|---|
| `docker-compose.dev.yml` | Development | `mongo-dev` on port 27017 | `Dockerfile.dev` + live volume mounts |
| `docker-compose.prod.yml` | Production | `mongo-prod` (not exposed) | `Dockerfile` (baked images) |

---

## Environments

```bash
# Development — live reload, Compass access, port 4200 + 80
docker-compose -f docker-compose.dev.yml up

# Development with load balancing (3 backend instances)
docker-compose -f docker-compose.dev.yml up --scale backend=3

# Production — baked images, port 80 only
docker-compose -f docker-compose.prod.yml up
```

| Environment | Env File | Mongo host | Ports exposed |
|---|---|---|---|
| dev | `.env.dev` | `mongo-dev` | 27017, 4200, 80 |
| prod | `.env.prod` | `mongo-prod` | 80 only |

---

## Project Structure

```
practise-one/
├── backend/
│   ├── config/
│   │   ├── .env.dev           # dev environment variables (git ignored)
│   │   ├── .env.test          # test environment variables (git ignored)
│   │   ├── .env.prod          # prod environment variables (git ignored)
│   │   └── .env.example       # template for env files
│   ├── models/
│   │   └── schema.js          # Mongoose recipe schema
│   ├── app.js                 # Express app, routes, MongoDB connection
│   ├── index.js               # HTTP server entry point
│   ├── handler.js             # Server error and listen handlers
│   ├── seed.js                # Database seed script
│   ├── Dockerfile             # Production image
│   └── Dockerfile.dev         # Development image (no source copy)
├── src/                       # Angular source code
├── nginx/
│   └── nginx.conf             # Nginx reverse proxy + load balancer config
├── Dockerfile                 # Frontend production image (multi-stage, Nginx)
├── Dockerfile.dev             # Frontend development image (ng serve)
├── docker-compose.yml         # Base config (production-ready)
├── docker-compose.override.yml # Dev overrides (auto-merged locally)
└── angular.json
```

---

## Seeding the Database

Make sure the app is running, then:

```bash
docker-compose -f docker-compose.dev.yml exec backend node migration-scripts/seed.js
```

Or run it directly if MongoDB is running locally:

```bash
node backend/migration-scripts/seed.js
```

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `NODE_ENV` | Environment name | `dev`, `test`, `prod` |
| `PORT` | Backend server port | `3000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://mongo:27017/project_yum_recipes` |

---

## Branching Strategy

```
feature/xxx  →  PR into ganymed  →  CI checks run  →  merge  →  auto-deploy
```

| Branch | Purpose |
|---|---|
| `ganymed` | Production branch — merging here triggers deployment |
| `develop` | Integration branch — features merge here first |
| `feature/xxx` | One branch per feature |
| `fix/xxx` | One branch per bug fix |

---

## CI/CD

Two GitHub Actions workflows:

**`.github/workflows/ci.yml`** — runs on every PR into `ganymed`:
- Backend: dependency install + syntax check
- Frontend: dependency install + build
- Tests slot in here when added

**`.github/workflows/deploy.yml`** — runs on merge into `ganymed`:
- Backend: triggers Render deploy hook
- Frontend: deploys to Vercel via CLI

---

## Cloud Deployment (Production)

| Layer | Service |
|---|---|
| Frontend | Vercel |
| Backend | Render (Docker) |
| Database | MongoDB Atlas |
| DNS/CDN | Cloudflare |

### Required GitHub Secrets

Set these in GitHub → Settings → Secrets → Actions:

| Secret | Where to get it |
|---|---|
| `RENDER_DEPLOY_HOOK_URL` | Render dashboard → your service → Deploy Hook |
| `VERCEL_TOKEN` | Vercel dashboard → Settings → Tokens |
| `VERCEL_ORG_ID` | Vercel dashboard → Settings → General |
| `VERCEL_PROJECT_ID` | Vercel dashboard → your project → Settings |

### MongoDB Atlas

1. Create a free cluster at mongodb.com/atlas
2. Get the connection string
3. Set it as `MONGO_URI` in Render environment variables

---

## Future Roadmap

See [PLATFORM_PLAN.md](./PLATFORM_PLAN.md) for the full architecture plan including multi-tenancy, authentication, RBAC and Keycloak.
