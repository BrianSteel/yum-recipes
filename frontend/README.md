# Yum Recipes — Frontend

Angular 11 single-page application.

> **Do not run this directly.** Use Docker Compose or Kubernetes from the project root. See the root README.

---

## Stack

- Angular 11
- Node 16 (required — Angular 11 is incompatible with Node 17+ due to OpenSSL)

## Structure

```
src/app/
├── recipes/           — recipe list, detail, create/edit form
├── shopping-list/     — shopping list page
├── header/            — navbar
└── shared/            — shared models and directives
```

## Dev (via Docker Compose)

```bash
# From project root
npm run docker:dev
```

Frontend runs at http://localhost:80 (via Nginx reverse proxy) or http://localhost:4200 (direct).

## Production Build (via Kubernetes)

```bash
# From project root — build context must be root so nginx/frontend.conf is accessible
docker build -t yum-recipes-frontend:latest -f ./frontend/Dockerfile .
```

## Nginx Config

In production (Kubernetes), the built Angular app is served by Nginx inside the container. A custom config (`nginx/frontend.conf`) is required to handle Angular client-side routing — without it, routes like `/shopping-list` return 404.

## Note on Protractor

The `frontend/e2e/` folder contains the default Angular CLI Protractor boilerplate. It is unused — all e2e tests are in the root `e2e/` folder using Playwright.
