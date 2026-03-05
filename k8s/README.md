# Kubernetes — Yum Recipes

Part of a portfolio project demonstrating production-grade Kubernetes patterns. Uses K3d (K3s inside Docker) for local development with two ingress controller options: Traefik (K3d default) and Nginx.

> **This setup is for local development only.** For real environments, see below:
>
> | Environment | Tool |
> |---|---|
> | **AWS EKS** | `eksctl` + `kubectl` |
> | **Google GKE** | `gcloud` + `kubectl` |
> | **Azure AKS** | `az` CLI + `kubectl` |
> | **Edge devices** (Raspberry Pi, IoT, edge servers) | K3s directly — same manifests, no Docker wrapper needed |
>
> For CD, use **GitHub Actions** — add a deploy workflow that runs `kubectl apply` against your remote cluster after tests pass.

---

## Prerequisites

```bash
brew install k3d
brew install kubectl
```

Docker Desktop must be running.

---

## Quick Start

### Deploy with Traefik (K3d built-in)

```bash
# First time — build images and deploy
bash k8s/scripts/deploy-traefik.sh --build

# Subsequent runs — skip build (faster)
bash k8s/scripts/deploy-traefik.sh
```

### Deploy with Nginx

```bash
# First time — build images and deploy
bash k8s/scripts/deploy-nginx.sh --build

# Subsequent runs — skip build (faster)
bash k8s/scripts/deploy-nginx.sh
```

> **Note:** You cannot run both at the same time. Both scripts use the same cluster name (`yum-recipes`) and port 80. Running one will delete the other.

App runs at http://localhost:80

---

## What the Scripts Do

Both scripts run these steps in order:

1. Delete existing cluster if it exists
2. Create a new K3d cluster with port 80 mapped
3. *(Nginx only)* Install the Nginx ingress controller and wait for it to be ready
4. *(If `--build`)* Build Docker images for backend and frontend
5. Import images into K3d (required — K3d has its own isolated image registry)
6. Apply namespace manifest
7. Apply Kustomize overlay (traefik or nginx)
8. Wait for all pods to be ready
9. Seed the database (recipes + shopping list)

---

## --build Flag

> **DEFAULT: build is SKIPPED**

| Command | What it does |
|---|---|
| `bash k8s/scripts/deploy-traefik.sh` | Skip build, use existing images (fast) |
| `bash k8s/scripts/deploy-traefik.sh --build` | Rebuild images from scratch |
| `bash k8s/scripts/deploy-nginx.sh` | Skip build, use existing images (fast) |
| `bash k8s/scripts/deploy-nginx.sh --build` | Rebuild images from scratch |

Always pass `--build` when you've made code changes to backend or frontend.

---

## npm Scripts

These are shortcuts defined in the root `package.json`:

| Command | What it does |
|---|---|
| `npm run k8s:traefik` | Deploy with Traefik (no build, no tests) |
| `npm run k8s:traefik:test` | Deploy + backend tests + smoke tests + perf tests |
| `npm run k8s:nginx` | Deploy with Nginx (no build, no tests) |
| `npm run k8s:nginx:test` | Deploy + backend tests + smoke tests + perf tests |

---

## Structure

```
k8s/
├── README.md
├── namespace.yml                — yum-recipes namespace
├── scripts/
│   ├── _deploy.sh               — shared deploy logic (sourced by all scripts)
│   ├── deploy-traefik.sh        — deploy with Traefik ingress
│   ├── deploy-traefik-full.sh   — deploy with Traefik + build images
│   ├── deploy-traefik-test.sh   — deploy with Traefik + tests
│   ├── deploy-nginx.sh          — deploy with Nginx ingress
│   ├── deploy-nginx-full.sh     — deploy with Nginx + build images
│   └── deploy-nginx-test.sh     — deploy with Nginx + tests
├── base/                        — shared manifests (all environments)
│   ├── kustomization.yml
│   ├── backend/
│   │   ├── deployment.yml       — readiness/liveness probes, resource limits
│   │   ├── service.yml
│   │   ├── configmap.yml        — NODE_ENV, PORT, MONGO_URI
│   │   └── secret.yml           — base64 encoded secrets
│   ├── frontend/
│   │   ├── deployment.yml       — serves built Angular app via Nginx
│   │   └── service.yml
│   ├── mongodb/
│   │   ├── deployment.yml
│   │   ├── service.yml
│   │   └── pvc.yml              — 1Gi PersistentVolumeClaim
│   └── nginx/
│       └── ingress.yml          — routes /api -> backend, / -> frontend
└── overlays/
    ├── traefik/                 — ingressClassName: traefik, no annotations
    ├── nginx/                   — ingressClassName: nginx, rewrite-target annotation
    ├── dev/                     — 1 backend replica, NODE_ENV=dev
    └── prod/                    — 3 backend replicas, NODE_ENV=prod
```

---

## Kustomize

Manifests are managed with Kustomize (built into `kubectl` — no install needed).

- `base/` — shared manifests, environment-agnostic
- `overlays/` — environment-specific patches (replicas, env vars, ingress class)

```bash
# Preview rendered manifests without applying
kubectl kustomize k8s/overlays/traefik
kubectl kustomize k8s/overlays/nginx
```

---

## Traefik vs Nginx

| | Traefik | Nginx |
|---|---|---|
| Installed by | K3d (built-in) | Manually via manifest |
| Annotation needed | No | `nginx.ingress.kubernetes.io/rewrite-target: /` |
| Disable flag | N/A | `--disable=traefik@server:0` on cluster create |
| Industry usage | Common in K3s/K3d | More common in production |

---

## Key Concepts

| Concept | Explanation |
|---|---|
| `imagePullPolicy: Never` | Forces K3d to use locally imported images — never pull from Docker Hub |
| `k3d image import` | Copies Docker images into K3d's isolated registry — required after every build |
| PersistentVolumeClaim | MongoDB data storage — survives pod restarts but not cluster deletion |
| Readiness probe | Kubernetes waits for this to pass before sending traffic to the pod |
| Liveness probe | Kubernetes restarts the pod if this fails |
| Resource requests/limits | Guarantees minimum resources and caps maximum per pod |
| Namespace | Isolates all app resources under `yum-recipes` |

---

## Useful Commands

```bash
# Check all pods
kubectl get pods -n yum-recipes

# Check all resources
kubectl get all -n yum-recipes

# Check ingress
kubectl get ingress -n yum-recipes

# View pod logs
kubectl logs <pod-name> -n yum-recipes

# Shell into a pod
kubectl exec -it <pod-name> -n yum-recipes -- sh

# Seed database manually
kubectl exec -n yum-recipes deployment/backend -- node migration-scripts/seed.js
kubectl exec -n yum-recipes deployment/backend -- node migration-scripts/seed-shopping-list.js

# Delete cluster
k3d cluster delete yum-recipes
```

---

## Nginx Config for Frontend

The frontend pod serves the built Angular app using Nginx. A custom config is required to handle Angular's client-side routing (redirect all routes to `index.html`):

- Config file: `nginx/frontend.conf`
- Copied into the frontend image via `frontend/Dockerfile`
- Without this, routes like `/shopping-list` return 404

---

## Important Notes

- **Do not use underscores** in Kubernetes resource names — RFC 1123 requires lowercase letters, numbers and hyphens only
- **K3d images are isolated** — even if the image exists in Docker, you must run `k3d image import` after every build
- **MongoDB uses a PVC** — only one MongoDB pod can own the volume at a time. If two pods fight over it (exit code 100), delete the erroring pod and run `kubectl rollout undo deployment/mongodb -n yum-recipes`
- **Port 80 conflict** — if cluster creation fails with "port already allocated", your Docker Compose dev stack is running. Stop it with `npm run docker:dev:down` first
- **Frontend build context is root** (`.`) not `./frontend` — required so Docker can access `nginx/frontend.conf` during the build
