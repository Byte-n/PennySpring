#!/bin/bash
set -e

ADB="${ANDROID_HOME:-$HOME/Library/Android/sdk}/platform-tools/adb"
REMOTE_DB="/data/data/com.pennyspring/databases/pennyspring.db"
LOCAL_DB="$(pwd)/pennyspring.db"
INTERVAL="${1:-2}"

if ! "$ADB" get-state >/dev/null 2>&1; then
  echo "No connected device/emulator." >&2
  exit 1
fi

echo "Watching $REMOTE_DB (every ${INTERVAL}s). Output: $LOCAL_DB"

last=""
while true; do
  mtime="$("$ADB" shell run-as com.pennyspring stat -c %Y "$REMOTE_DB" 2>/dev/null || true)"
  if [ -n "$mtime" ] && [ "$mtime" != "$last" ]; then
    "$ADB" shell run-as com.pennyspring cat "$REMOTE_DB" > "$LOCAL_DB"
    echo "[$(date '+%H:%M:%S')] updated -> $LOCAL_DB"
    last="$mtime"
  fi
  sleep "$INTERVAL"
done
