#!/bin/bash
# Full script — supports --build and --test flags
# Usage:
#   bash k8s/scripts/deploy-traefik-full.sh              # deploy only
#   bash k8s/scripts/deploy-traefik-full.sh --build      # rebuild images + deploy
#   bash k8s/scripts/deploy-traefik-full.sh --test       # deploy + all tests
#   bash k8s/scripts/deploy-traefik-full.sh --build --test  # rebuild + deploy + all tests
set -e
cd "$(dirname "$0")/../.."

BUILD=false
TEST=false
for arg in "$@"; do
  case $arg in
    --build) BUILD=true ;;
    --test) TEST=true ;;
  esac
done

bash k8s/scripts/_deploy.sh traefik $BUILD $TEST
