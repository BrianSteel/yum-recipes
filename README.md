# Yum Recipes

A portfolio project demonstrating production-grade patterns I've used professionally — containerisation, orchestration, CI/CD, automated testing and infrastructure-as-code. Built as a simple recipe app to keep the domain logic minimal so the engineering practices are the focus.

**This is a demo project, not a production app.** Intentionally not included:
- Monitoring / observability (Prometheus, Grafana)
- Log aggregation (ELK, Loki)
- Authentication / RBAC
- Rate limiting
- HTTPS / TLS certificates

These are areas I have professional experience with but are out of scope for this demo.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 11 |
| Backend | Node.js / Express |
| Database | MongoDB |
| Reverse Proxy | Nginx |
| Containerisation | Docker + Docker Compose |
| Orchestration | Kubernetes (K3d / K3s) |
| CI | GitHub Actions |
| CD | Render (backend) + Vercel (frontend) |

---

## Architecture

### Docker Compose

```
localhost:80
      ↓
   Nginx (reverse proxy + load balancer)
   ↓                         ↓
/api                         /
   ↓                         ↓
Backend x3 replicas      Frontend (Angular dev server)
   ↓
MongoDB
```

### Kubernetes (K3d)

```
localhost:80
      ↓
   Ingress Controller (Traefik or Nginx)
   ↓                         ↓
/api                         /
   ↓                         ↓
Backend pods (x1 dev,    Frontend pod (Nginx serving built Angular)
 x3 prod)
   ↓
MongoDB pod + PersistentVolumeClaim
```

---

## Prerequisites

- Docker Desktop

For Kubernetes:
- `brew install k3d`
- `brew install kubectl`

---

## Getting Started

### Docker Compose (dev)

```bash
npm run docker:dev
npm run seed
npm run seed:shopping-list
```

### Kubernetes (local K3d)

```bash
npm run k8s:traefik       # deploy with Traefik ingress
npm run k8s:nginx         # deploy with Nginx ingress
```

App runs at http://localhost:80

---

## Commands

### Docker Compose

| Command | What it does |
|---|---|
| `npm run docker:dev` | Start dev stack |
| `npm run docker:dev:build` | Build images and start |
| `npm run docker:dev:down` | Stop dev stack |
| `npm run docker:dev:restart` | Restart dev stack |
| `npm run docker:scale` | Start with 3 backend replicas |
| `npm run seed` | Seed recipes |
| `npm run seed:shopping-list` | Seed shopping list |
| `npm run install:all` | Install all dependencies (backend, frontend, e2e, perf) |

### Tests

| Command | What it does |
|---|---|
| `npm run test:backend` | Run Jest unit tests |
| `npm run test:e2e` | Run Playwright e2e tests (requires `nvm use 24`) |
| `npm run test:perf` | Run performance tests (requires app on localhost:80) |

### Kubernetes

| Command | What it does |
|---|---|
| `npm run k8s:traefik` | Deploy with Traefik (fast, no build, no tests) |
| `npm run k8s:traefik:test` | Deploy + backend tests + smoke tests + perf tests |
| `npm run k8s:nginx` | Deploy with Nginx (fast, no build, no tests) |
| `npm run k8s:nginx:test` | Deploy + backend tests + smoke tests + perf tests |

For full control use the scripts directly — see [k8s/README.md](k8s/README.md).

---

## API Routes

| Method | Route | Description |
|---|---|---|
| GET | `/api/recipes` | Get all recipes |
| POST | `/api/recipes` | Create a recipe |
| PUT | `/api/recipe/:id` | Update a recipe |
| DELETE | `/api/recipe/:id` | Delete a recipe |
| GET | `/api/shopping-list` | Get all shopping list items |
| POST | `/api/shopping-list` | Add a shopping list item |
| PUT | `/api/shopping-list/:id` | Update a shopping list item |
| DELETE | `/api/shopping-list/:id` | Delete a shopping list item |

---

## Project Structure

```
├── backend/
│   ├── config/            .env.dev, .env.test, .env.prod, .env.example
│   ├── migration-scripts/ seed.js, seed-shopping-list.js
│   ├── models/            schema.js, shoppingListSchema.js
│   ├── tests/             recipes.test.js (Jest + Supertest)
│   ├── app.js             Express routes
│   ├── index.js           Server entry point
│   ├── Dockerfile         Production image
│   └── Dockerfile.dev     Dev image
├── frontend/              Angular 11 source
│   ├── Dockerfile         Production image (multi-stage: Node 16 build + Nginx serve)
│   └── Dockerfile.dev     Dev image (ng serve on Node 16)
├── e2e/                   Playwright tests
├── perf/                  Performance tests (autocannon)
├── nginx/
│   ├── nginx.conf         Reverse proxy for Docker Compose
│   └── frontend.conf      Static file server for K8s frontend pod
├── k8s/
│   ├── scripts/           Deploy scripts (Traefik + Nginx variants)
│   ├── base/              Shared K8s manifests
│   ├── overlays/          Environment-specific patches (traefik, nginx, dev, prod)
│   └── namespace.yml
├── docker-compose.dev.yml Dev stack
├── docker-compose.prod.yml Production stack
└── package.json           Root npm scripts
```

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `NODE_ENV` | Environment | `dev`, `test`, `prod` |
| `PORT` | Backend port | `3000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://mongo-dev:27017/project_yum_recipes` |

---

## Docker Compose

| File | Use |
|---|---|
| `docker-compose.dev.yml` | Dev — live mounts, ports exposed, Node 16 frontend |
| `docker-compose.prod.yml` | Prod demo — baked images, port 80 only |

---

## Kubernetes

Local K8s setup using K3d (K3s inside Docker). Supports both Traefik and Nginx ingress controllers. Uses Kustomize for environment management.

See [k8s/README.md](k8s/README.md) for full Kubernetes docs.

---

## CI/CD

**`ci.yml`** — runs on every PR (any branch): Jest tests, frontend build, Playwright e2e

**`deploy.yml`** — runs on merge into `ganymed`: deploys backend to Render, frontend to Vercel

> K8s deploy scripts are for local K3d only. For cloud K8s (EKS, GKE, AKS), use GitHub Actions CD or ArgoCD. For edge devices, use K3s directly.

### Required Secrets

| Secret | Where |
|---|---|
| `RENDER_DEPLOY_HOOK_URL` | Render → your service → Deploy Hook |
| `VERCEL_TOKEN` | Vercel → Settings → Tokens |
| `VERCEL_ORG_ID` | Vercel → Settings → General |
| `VERCEL_PROJECT_ID` | Vercel → your project → Settings |

---

## Cloud Deployment

| Layer | Service |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |

---

## Branching Strategy

```
feature/xxx  →  PR (any branch)  →  tests run
                     ↓
             PR into ganymed  →  full CI  →  merge  →  deploy
```
