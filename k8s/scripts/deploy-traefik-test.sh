#!/bin/bash
# Deploy + run all tests — no image rebuild
# Usage: bash k8s/scripts/deploy-traefik-test.sh
set -e
cd "$(dirname "$0")/../.."
bash k8s/scripts/_deploy.sh traefik false true
