#!/bin/bash
# Deploy only — no tests, no image rebuild
# Usage: bash k8s/scripts/deploy-nginx.sh
set -e
cd "$(dirname "$0")/../.."
bash k8s/scripts/_deploy.sh nginx false false
