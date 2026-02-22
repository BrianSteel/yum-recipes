# Yum Recipes — E2E Tests

End-to-end tests using [Playwright](https://playwright.dev/).

**Requires the app to be running on `http://localhost:80`** (either Docker Compose or K3d).

---

## Prerequisites

- Node >= 24 (`nvm use 24`)
- Playwright browsers installed

```bash
# From project root — installs dependencies + Chromium
npm run test:e2e:install
```

---

## Run

```bash
# From project root
npm run test:e2e

# From e2e/
npm test
```

### Other modes

| Command | What it does |
|---|---|
| `npm run test:e2e` | Headless (default) |
| `npm run test:e2e:headed` | Visible browser |
| `npm run test:e2e:ui` | Playwright UI mode |

---

## What It Tests

| Test file | What it covers |
|---|---|
| `navigation.spec.ts` | Page navigation between routes |
| `recipe-list.spec.ts` | Recipe list page |
| `recipe-detail.spec.ts` | Individual recipe view |
| `recipe-form.spec.ts` | Create/edit recipe form |
| `shopping-list.spec.ts` | Shopping list CRUD |

---

## Config

- `playwright.config.ts` — base URL, browser, retries, reporter
- `global-setup.ts` — runs before all tests: clears shopping list and seeds known state via the API
- Runs on Chromium only
- Sequential (`workers: 1`, `fullyParallel: false`) — tests depend on shared database state
- CI uses `github` reporter, local uses `html`

---

## Note on frontend/e2e/

The `frontend/e2e/` folder is default Angular CLI Protractor boilerplate — it is unused. All e2e tests live here in the root `e2e/` folder.
