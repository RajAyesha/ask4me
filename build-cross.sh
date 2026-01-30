#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$root_dir"

dist_dir="$root_dir/dist"
mkdir -p "$dist_dir"

rm -f "$dist_dir"/ask4me-* "$dist_dir"/checksums.txt 2>/dev/null || true

targets=(
  "darwin/amd64"
  "darwin/arm64"
  "linux/amd64"
  "linux/arm64"
  "windows/amd64"
  "windows/arm64"
)

for t in "${targets[@]}"; do
  os="${t%/*}"
  arch="${t#*/}"
  out="$dist_dir/ask4me-${os}-${arch}"
  if [[ "$os" == "windows" ]]; then
    out="${out}.exe"
  fi
  echo "building $out"
  env CGO_ENABLED=0 GOOS="$os" GOARCH="$arch" go build -trimpath -ldflags "-s -w" -o "$out" .
done

cd "$dist_dir"
if command -v shasum >/dev/null 2>&1; then
  shasum -a 256 ask4me-* > checksums.txt
elif command -v sha256sum >/dev/null 2>&1; then
  sha256sum ask4me-* > checksums.txt
else
  echo "no sha256 tool found (need shasum or sha256sum)" >&2
  exit 1
fi

echo "done: $dist_dir"
