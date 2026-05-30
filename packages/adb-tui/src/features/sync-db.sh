#!/bin/bash
# Usage: sync-db.sh ADB SERIAL PACKAGE REMOTE_DB LOCAL_DB INTERVAL_SEC
# Polls the remote SQLite mtime; on change, pulls via run-as and prints "PULL".
set -u

ADB="$1"
SERIAL="$2"
PACKAGE="$3"
REMOTE_DB="$4"
LOCAL_DB="$5"
INTERVAL="$6"

last=""
while true; do
  mtime="$("$ADB" -s "$SERIAL" shell run-as "$PACKAGE" stat -c %Y "$REMOTE_DB" 2>/dev/null || true)"
  if [ -n "$mtime" ] && [ "$mtime" != "$last" ]; then
    if "$ADB" -s "$SERIAL" shell run-as "$PACKAGE" cat "$REMOTE_DB" > "$LOCAL_DB"; then
      echo "PULL"
      last="$mtime"
    fi
  fi
  sleep "$INTERVAL"
done
