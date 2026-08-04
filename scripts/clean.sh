#!/bin/bash
set -e

# 项目根（yarn workspace 根）：scripts 目录的上一级
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# 要清理的原生 app 目录，默认为项目根；可用 --app <dir> 指定
APP_DIR="$PROJECT_ROOT"
DEEP_CLEAN=false

while [ $# -gt 0 ]; do
  case "$1" in
    --deep) DEEP_CLEAN=true; shift;;
    --app)
      [ -d "$2" ] || { echo "--app: 目录不存在: $2" >&2; exit 1; }
      APP_DIR="$(cd "$2" && pwd)"; shift 2
      ;;
    *) echo "Unknown argument: $1" >&2; exit 1;;
  esac
done

# 安全护栏：核心路径必须为非空绝对路径且位于项目内，
# 杜绝变量为空或指向系统目录时拼出 "/xxx" 误删系统内容。
# 任何不合法输入一律立即报错并终止程序。
validate_path() {
  local label="$1" path="$2" root="$3"
  # 1. 非空绝对路径
  case "$path" in
    /*) : ;;
    *) echo "$label 非法：必须为非空绝对路径，实际为 '$path'" >&2; exit 1;;
  esac
  # 2. 不能是根目录
  [ "$path" != "/" ] || { echo "$label 非法：不能是根目录 /" >&2; exit 1; }
  # 3. 必须存在且为目录
  [ -d "$path" ] || { echo "$label 非法：目录不存在 '$path'" >&2; exit 1; }
  # 4. 必须位于项目内（root 为空时仅校验自身，用于 PROJECT_ROOT）
  if [ -n "$root" ]; then
    case "$path" in
      "$root"|"$root"/*) : ;;
      *) echo "$label 非法：必须位于项目内 '$root'，实际为 '$path'" >&2; exit 1;;
    esac
  fi
}

validate_path "PROJECT_ROOT" "$PROJECT_ROOT" ""
validate_path "APP_DIR" "$APP_DIR" "$PROJECT_ROOT"

echo "=== Cleaning build artifacts (dist/dists/docs-dist/docs-dists) ==="
find "$PROJECT_ROOT" -type d -name node_modules -prune \
  -o -type d \( -name "dist" -o -name "dists" -o -name "docs-dist" -o -name "docs-dists" \) -prune -exec rm -rf {} +
echo "Build artifacts cleaned."

echo "=== Cleaning Android ==="
if [ -f "$APP_DIR/android/gradlew" ]; then
  "$APP_DIR/android/gradlew" -p "$APP_DIR/android" clean 2>/dev/null || true
  # 必须增加这一行！删除原生编译缓存
  rm -rf "$APP_DIR/android/app/.cxx" "$APP_DIR/android/.cxx" "$APP_DIR/android/.gradle" "$APP_DIR/android/app/build" "$APP_DIR/android/build"
  echo "Android & C++ Cache cleaned."
fi

echo "=== Cleaning iOS ==="
if [ -d "$APP_DIR/ios" ]; then
  rm -rf "$APP_DIR/ios/build" "$APP_DIR/ios/Pods" "$APP_DIR/ios/Podfile.lock"
  if [ "$DEEP_CLEAN" = true ]; then
    rm -rf "$HOME/Library/Developer/Xcode/DerivedData"/*
    echo "Xcode DerivedData cleaned."
  fi
  echo "iOS cleaned."
fi

echo "=== Cleaning Metro cache ==="
rm -rf /tmp/metro-* /tmp/haste-map-*
watchman watch-del-all 2>/dev/null || true
echo "Metro cache cleaned."

echo "=== Cleaning node_modules ==="
rm -rf "$PROJECT_ROOT/node_modules" "$PROJECT_ROOT"/packages/*/node_modules "$APP_DIR/node_modules"
echo "node_modules cleaned."

echo "=== Reinstalling dependencies ==="
cd "$PROJECT_ROOT" && yarn install

echo "=== Done ==="
