#!/bin/bash
# Deploy + run all tests — no image rebuild
# Usage: bash k8s/scripts/deploy-nginx-test.sh
set -e
cd "$(dirname "$0")/../.."
bash k8s/scripts/_deploy.sh nginx false true
