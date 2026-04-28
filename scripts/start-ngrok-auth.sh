#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$script_dir/.." && pwd)"
env_file="$repo_root/apps/backend/.dev.vars"

if ! command -v ngrok >/dev/null 2>&1; then
  echo "ngrok is required."
  exit 1
fi

if ! command -v bun >/dev/null 2>&1; then
  echo "bun is required."
  exit 1
fi

if [ ! -f "$env_file" ]; then
  echo "Missing $env_file"
  exit 1
fi

copy_to_clipboard() {
  local value="$1"

  if command -v wl-copy >/dev/null 2>&1; then
    printf '%s' "$value" | wl-copy
    return 0
  fi

  if command -v xclip >/dev/null 2>&1; then
    printf '%s' "$value" | xclip -selection clipboard
    return 0
  fi

  if command -v xsel >/dev/null 2>&1; then
    printf '%s' "$value" | xsel --clipboard --input
    return 0
  fi

  if command -v pbcopy >/dev/null 2>&1; then
    printf '%s' "$value" | pbcopy
    return 0
  fi

  return 1
}

log_file="$(mktemp -t opendesign-ngrok.XXXXXX.log)"
ngrok http http://127.0.0.1:3000 --log=stdout >"$log_file" 2>&1 &
ngrok_pid=$!

cleanup() {
  kill "$ngrok_pid" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

until public_url="$(curl -sf http://127.0.0.1:4040/api/tunnels | bun -e 'const data = JSON.parse(await Bun.stdin.text()); const tunnel = data.tunnels.find((item) => item.proto === "https"); if (!tunnel?.public_url) process.exit(1); process.stdout.write(tunnel.public_url);' 2>/dev/null)" && [ -n "$public_url" ]; do
  sleep 1
done

PUBLIC_URL="$public_url" ENV_FILE="$env_file" bun -e '
  const fs = require("node:fs");

  const envFile = process.env.ENV_FILE;
  const publicUrl = process.env.PUBLIC_URL;
  const trustedOrigins = `${publicUrl},http://localhost:3000`;
  const lines = fs.readFileSync(envFile, "utf8").split(/\r?\n/);

  let sawUrl = false;
  let sawTrustedOrigins = false;

  const rewritten = [];

  for (const line of lines) {
    if (line.startsWith("BETTER_AUTH_URL=")) {
      if (!sawUrl) {
        rewritten.push(`BETTER_AUTH_URL=${publicUrl}`);
        sawUrl = true;
      }
      continue;
    }

    if (line.startsWith("BETTER_AUTH_TRUSTED_ORIGINS=")) {
      if (!sawTrustedOrigins) {
        rewritten.push(`BETTER_AUTH_TRUSTED_ORIGINS=${trustedOrigins}`);
        sawTrustedOrigins = true;
      }
      continue;
    }

    rewritten.push(line);
  }

  if (!sawUrl) {
    rewritten.push(`BETTER_AUTH_URL=${publicUrl}`);
  }

  if (!sawTrustedOrigins) {
    rewritten.push(`BETTER_AUTH_TRUSTED_ORIGINS=${trustedOrigins}`);
  }

  fs.writeFileSync(envFile, `${rewritten.join("\n").replace(/\n+$/, "")}\n`);
'

printf 'Updated %s with %s\n' "$env_file" "$public_url"

if copy_to_clipboard "$public_url"; then
  printf 'Copied ngrok URL to clipboard\n'
else
  printf 'Clipboard copy skipped: no supported clipboard tool found\n'
fi

tail --pid="$ngrok_pid" -f "$log_file"
