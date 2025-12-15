#!/usr/bin/env bash
set -euo pipefail

LOG_DIR="logs"
TS="$(date +%Y%m%d-%H%M%S)"
INSTALL_LOG="$LOG_DIR/repair-install-$TS.log"
BUILD_LOG="$LOG_DIR/repair-build-$TS.log"
CHECK_UPDATES=false
USE_LOCAL_STORE=""
LOCAL_STORE_DIR=".pnpm-store"
CHECK_NETWORK=true

while [[ $# -gt 0 ]]; do
  case "$1" in
    --check-updates)
      CHECK_UPDATES=true
      shift
      ;;
    --offline-only)
      CHECK_NETWORK=false
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

if [[ -t 0 ]]; then
  read -r -p "Use local pnpm store mirror at ${LOCAL_STORE_DIR}? [y/N] " REPLY
  if [[ "$REPLY" =~ ^[Yy]$ ]]; then
    USE_LOCAL_STORE="--store-dir ${LOCAL_STORE_DIR}"
    echo "Local store selected: ${LOCAL_STORE_DIR}" | tee -a "$INSTALL_LOG"
  fi
fi

if $CHECK_UPDATES; then
  echo "== Version check (use latest stable Node/pnpm for reliability) ==" | tee -a "$INSTALL_LOG"
  node -v 2>&1 | tee -a "$INSTALL_LOG" || true
  pnpm -v 2>&1 | tee -a "$INSTALL_LOG" || true
  echo "Hint: upgrade via corepack (Node 18+): corepack prepare pnpm@latest --activate" | tee -a "$INSTALL_LOG"
  echo "If Node is old, consider using mise/nodenv/nvm to pin a current LTS." | tee -a "$INSTALL_LOG"
fi

mkdir -p "$LOG_DIR"

echo "== Cleaning .next and node_modules ==" | tee -a "$INSTALL_LOG"
rm -rf .next node_modules || true

if $CHECK_NETWORK; then
  echo "== Connectivity check to registry.npmjs.org ==" | tee -a "$INSTALL_LOG"
  if curl -I --max-time 5 https://registry.npmjs.org >/dev/null 2>&1; then
    echo "Registry reachable." | tee -a "$INSTALL_LOG"
  else
    echo "Registry unreachable; relying on cache/local store." | tee -a "$INSTALL_LOG"
  fi
fi

echo "== Installing deps with pnpm (prefer offline, retries) ==" | tee -a "$INSTALL_LOG"
pnpm install ${USE_LOCAL_STORE} --prefer-offline --fetch-retries=8 --fetch-retry-factor=2 --fetch-retry-maxtimeout=120000 2>&1 | tee -a "$INSTALL_LOG"

echo "== Forcing Webpack build with debug and no worker threads ==" | tee -a "$BUILD_LOG"
NEXT_PRIVATE_BUILD_WORKER_THREADS=0 NEXT_TELEMETRY_DISABLED=1 \
  pnpm build --webpack --debug 2>&1 | tee -a "$BUILD_LOG"

echo "== Build finished. Check $BUILD_LOG for output. =="

echo "== Running type-check ==" | tee -a "$BUILD_LOG"
pnpm type-check 2>&1 | tee -a "$BUILD_LOG"
