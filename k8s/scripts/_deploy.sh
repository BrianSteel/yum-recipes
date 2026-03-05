#!/bin/bash
# Core deploy script — called by all other scripts
# Args: $1=ingress (traefik|nginx) $2=build (true|false) $3=test (true|false)
set -e

INGRESS=$1
BUILD=$2
TEST=$3
CLUSTER_NAME="yum-recipes"
NGINX_MANIFEST="https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.1/deploy/static/provider/cloud/deploy.yaml"

# Install missing dependencies so tests never break
install_deps() {
  if [ ! -d "backend/node_modules" ]; then
    echo ">>> Installing backend dependencies..."
    cd backend && npm install && cd ..
  fi
  if [ ! -d "perf/node_modules" ]; then
    echo ">>> Installing perf dependencies..."
    cd perf && npm install && cd ..
  fi
}

install_deps

if [ "$TEST" = true ]; then
  echo ">>> Running backend tests..."
  cd backend && npm test && cd ..
fi

echo ">>> Deleting existing cluster if it exists..."
k3d cluster delete $CLUSTER_NAME 2>/dev/null || true

if [ "$INGRESS" = "nginx" ]; then
  echo ">>> Creating K3d cluster with Traefik disabled..."
  k3d cluster create $CLUSTER_NAME --port "80:80@loadbalancer" --k3s-arg "--disable=traefik@server:0"

  echo ">>> Installing Nginx ingress controller..."
  kubectl apply -f $NGINX_MANIFEST
  kubectl wait --namespace ingress-nginx --for=condition=ready pod --selector=app.kubernetes.io/component=controller --timeout=120s
else
  echo ">>> Creating K3d cluster with Traefik (default)..."
  k3d cluster create $CLUSTER_NAME --port "80:80@loadbalancer"
fi

if [ "$BUILD" = true ]; then
  echo ">>> Building Docker images..."
  docker build -t yum-recipes-backend:latest ./backend
  docker build -t yum-recipes-frontend:latest -f ./frontend/Dockerfile .
else
  echo ">>> Skipping build (use deploy-*-full.sh --build to rebuild)"
fi

echo ">>> Importing images into K3d..."
k3d image import yum-recipes-backend:latest yum-recipes-frontend:latest --cluster $CLUSTER_NAME

echo ">>> Deploying manifests..."
kubectl apply -f k8s/namespace.yml
kubectl apply -k k8s/overlays/$INGRESS

echo ">>> Waiting for pods to be ready..."
kubectl wait --for=condition=ready pod --selector=app=backend -n yum-recipes --timeout=120s
kubectl wait --for=condition=ready pod --selector=app=frontend -n yum-recipes --timeout=120s
kubectl wait --for=condition=ready pod --selector=app=mongodb -n yum-recipes --timeout=120s

echo ">>> Seeding database..."
kubectl exec -n yum-recipes deployment/backend -- node migration-scripts/seed.js
kubectl exec -n yum-recipes deployment/backend -- node migration-scripts/seed-shopping-list.js

if [ "$TEST" = true ]; then
  echo ">>> Running smoke tests..."
  FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:80/)
  RECIPES=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:80/api/recipes)
  SHOPPING=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:80/api/shopping-list)

  RECIPE_ID=$(curl -s -X POST http://localhost:80/api/recipes \
    -H "Content-Type: application/json" \
    -d '{"name":"Smoke Test","desc":"Smoke test recipe","imgPath":"http://test.com","ingredients":[]}' \
    | python3 -c "import sys,json; print(json.load(sys.stdin)['recipe']['_id'])" 2>/dev/null)
  if [ -n "$RECIPE_ID" ]; then
    curl -s -X DELETE http://localhost:80/api/recipe/$RECIPE_ID > /dev/null
    WRITE="PASS"
  else
    WRITE="FAIL"
  fi

  echo ""
  echo "=== Smoke Test Results ==="
  echo "Frontend:      $([ "$FRONTEND" = "200" ] && echo PASS || echo "FAIL (HTTP $FRONTEND)")"
  echo "GET /recipes:  $([ "$RECIPES" = "200" ] && echo PASS || echo "FAIL (HTTP $RECIPES)")"
  echo "GET /shopping: $([ "$SHOPPING" = "200" ] && echo PASS || echo "FAIL (HTTP $SHOPPING)")"
  echo "Write (POST/DELETE recipe): $WRITE"
  echo "=========================="
  echo ""

  if [ "$FRONTEND" != "200" ] || [ "$RECIPES" != "200" ] || [ "$SHOPPING" != "200" ] || [ "$WRITE" = "FAIL" ]; then
    echo ">>> Smoke tests FAILED"
    exit 1
  fi

  echo ">>> Running performance tests..."
  npm run test:perf
fi

echo ">>> Done. App running at http://localhost:80"
