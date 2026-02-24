# Yum Recipes — Backend

Node.js / Express REST API with MongoDB.

> **Do not run this directly.** Use Docker Compose or Kubernetes from the project root. See the root README.

---

## Stack

- Node.js (>=24) / Express 5
- MongoDB via Mongoose 9
- Jest + Supertest for tests
- mongodb-memory-server for in-memory test database

---

## Structure

```
backend/
├── app.js                  — Express routes (recipes + shopping list)
├── index.js                — Server entry point (connects to Mongo, starts listening)
├── handler.js              — Port normalisation and error handlers
├── models/
│   ├── schema.js           — Recipe schema (name, description, imagePath, ingredients)
│   └── shoppingListSchema.js — Shopping list item schema (name, amount)
├── migration-scripts/
│   ├── seed.js             — Seeds recipes into MongoDB
│   └── seed-shopping-list.js — Seeds shopping list items into MongoDB
├── config/
│   ├── .env.dev
│   ├── .env.test
│   ├── .env.prod
│   └── .env.example
├── tests/
│   └── recipes.test.js     — Jest + Supertest unit tests
├── Dockerfile              — Production image
└── Dockerfile.dev          — Dev image (nodemon)
```

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

## Tests

```bash
# From project root
npm run test:backend

# From backend/
npm test
```

Tests use mongodb-memory-server — no running MongoDB instance needed. Each test gets a clean database.

---

## Seeding

```bash
# Via Docker Compose
npm run seed
npm run seed:shopping-list

# Via Kubernetes
kubectl exec -n yum-recipes deployment/backend -- node migration-scripts/seed.js
kubectl exec -n yum-recipes deployment/backend -- node migration-scripts/seed-shopping-list.js
```

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `NODE_ENV` | Environment | `dev`, `test`, `prod` |
| `PORT` | Backend port | `3000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://mongo-dev:27017/project_yum_recipes` |

Config files in `config/` are loaded based on `NODE_ENV`. See `.env.example` for the template.
