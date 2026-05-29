#!/bin/bash
# Syncs local changes to the homelab and keeps dev containers running.
# Usage: ./scripts/dev-sync.sh [--start] [--stop]
# Requires: fswatch (brew install fswatch)

REMOTE="root@192.168.0.118"
REMOTE_DIR="/opt/gym-full"
STACK_DIR="/opt/stacks/gym-full"
LOCAL_DIR="$(cd "$(dirname "$0")/.." && pwd)"

RSYNC=/usr/bin/rsync
RSYNC_OPTS=(
  -az --delete
  --exclude='.git'
  --exclude='node_modules'
  --exclude='dist'
  --exclude='dist-ssr'
  --exclude='.env*'
  --exclude='*.log'
  --exclude='.DS_Store'
  --exclude='scripts/*/dist'
)

start_dev() {
  echo "→ Starting dev containers on homelab..."
  ssh "$REMOTE" "cd $STACK_DIR && docker compose -f compose.dev.yml up -d 2>&1"
  echo "✓ Dev containers started"
  echo "  Frontend: https://gym-dev.3dmc.lab"
  echo "  Backend:  https://gym-dev.3dmc.lab/api"
}

stop_dev() {
  echo "→ Stopping dev containers..."
  ssh "$REMOTE" "cd $STACK_DIR && docker compose -f compose.dev.yml down 2>&1"
  echo "✓ Done"
}

sync_once() {
  $RSYNC "${RSYNC_OPTS[@]}" "$LOCAL_DIR/" "$REMOTE:$REMOTE_DIR/"
}

watch_and_sync() {
  echo "→ Initial sync..."
  sync_once
  echo "✓ Synced. Watching for changes (Ctrl+C to stop)..."
  echo ""

  fswatch -o \
    --exclude='\.git' \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='\.DS_Store' \
    "$LOCAL_DIR" | while read -r; do
      sync_once && echo "  [$(date +%H:%M:%S)] synced"
  done
}

case "${1:-watch}" in
  --start)
    start_dev
    ;;
  --stop)
    stop_dev
    ;;
  --start-watch)
    start_dev
    watch_and_sync
    ;;
  watch|*)
    if ! command -v fswatch &>/dev/null; then
      echo "✗ fswatch not found — install with: brew install fswatch"
      exit 1
    fi
    watch_and_sync
    ;;
esac
