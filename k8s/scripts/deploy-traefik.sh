#!/bin/bash
# Deploy only — no tests, no image rebuild
# Usage: bash k8s/scripts/deploy-traefik.sh
set -e
cd "$(dirname "$0")/../.."
bash k8s/scripts/_deploy.sh traefik false false
