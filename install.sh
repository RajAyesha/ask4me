#!/bin/sh
set -eu

REPO="${ASK4ME_REPO:-easychen/ask4me}"
VERSION="${ASK4ME_VERSION:-latest}"
INSTALL_DIR="${ASK4ME_INSTALL_DIR:-}"

uname_s="$(uname -s 2>/dev/null || echo unknown)"
uname_m="$(uname -m 2>/dev/null || echo unknown)"

os=""
case "$uname_s" in
  Linux) os="linux" ;;
  Darwin) os="darwin" ;;
  MINGW*|MSYS*|CYGWIN*) os="windows" ;;
  *) echo "unsupported OS: $uname_s" >&2; exit 1 ;;
esac

arch=""
case "$uname_m" in
  x86_64|amd64) arch="amd64" ;;
  aarch64|arm64) arch="arm64" ;;
  *) echo "unsupported arch: $uname_m" >&2; exit 1 ;;
esac

ext=""
if [ "$os" = "windows" ]; then
  ext=".exe"
fi

asset="ask4me-${os}-${arch}${ext}"

tag_path=""
case "$VERSION" in
  latest) tag_path="releases/latest/download" ;;
  v*) tag_path="releases/download/$VERSION" ;;
  *) tag_path="releases/download/v$VERSION" ;;
esac

base_url="https://github.com/${REPO}/${tag_path}"
url="${base_url}/${asset}"

tmp_dir="$(mktemp -d 2>/dev/null || mktemp -d -t ask4me)"
cleanup() { rm -rf "$tmp_dir"; }
trap cleanup EXIT INT TERM

download() {
  out="$1"
  src="$2"
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL -o "$out" "$src"
    return 0
  fi
  if command -v wget >/dev/null 2>&1; then
    wget -qO "$out" "$src"
    return 0
  fi
  echo "missing downloader: curl or wget is required" >&2
  exit 1
}

bin_path="${tmp_dir}/${asset}"
download "$bin_path" "$url"

checksums_path="${tmp_dir}/checksums.txt"
if download "$checksums_path" "${base_url}/checksums.txt" 2>/dev/null; then
  if command -v shasum >/dev/null 2>&1; then
    expected="$(grep "  ${asset}\$" "$checksums_path" | awk '{print $1}' | head -n 1 || true)"
    if [ -n "$expected" ]; then
      got="$(shasum -a 256 "$bin_path" | awk '{print $1}')"
      if [ "${got}" != "${expected}" ]; then
        echo "sha256 mismatch: expected ${expected} got ${got}" >&2
        exit 1
      fi
    fi
  elif command -v sha256sum >/dev/null 2>&1; then
    expected="$(grep "  ${asset}\$" "$checksums_path" | awk '{print $1}' | head -n 1 || true)"
    if [ -n "$expected" ]; then
      got="$(sha256sum "$bin_path" | awk '{print $1}')"
      if [ "${got}" != "${expected}" ]; then
        echo "sha256 mismatch: expected ${expected} got ${got}" >&2
        exit 1
      fi
    fi
  fi
fi

if [ -z "$INSTALL_DIR" ]; then
  if [ "$(id -u 2>/dev/null || echo 1)" -eq 0 ]; then
    INSTALL_DIR="/usr/local/bin"
  elif [ -w "/usr/local/bin" ] 2>/dev/null; then
    INSTALL_DIR="/usr/local/bin"
  else
    INSTALL_DIR="${HOME}/.local/bin"
  fi
fi

mkdir -p "$INSTALL_DIR"

target="${INSTALL_DIR}/ask4me${ext}"
if command -v install >/dev/null 2>&1; then
  install -m 0755 "$bin_path" "$target"
else
  cp "$bin_path" "$target"
  if [ "$os" != "windows" ]; then
    chmod 0755 "$target"
  fi
fi

printf '%s\n' "installed: $target"
if [ "$INSTALL_DIR" = "${HOME}/.local/bin" ]; then
  printf '%s\n' "ensure PATH includes: ${HOME}/.local/bin"
fi
