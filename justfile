dev-auth session="opendesign" window="opendesign-dev":
    #!/usr/bin/env bash
    set -euo pipefail

    repo_root="{{justfile_directory()}}"
    session_name="{{session}}"
    window_name="{{window}}"
    env_file="$repo_root/apps/backend/.dev.vars"

    if ! command -v tmux >/dev/null 2>&1; then
      echo "tmux is required."
      exit 1
    fi

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

    pages_cmd="cd '$repo_root' && bun run dev:pages"
    backend_cmd="cd '$repo_root' && bun run dev:backend"
    ngrok_cmd="cd '$repo_root' && bash '$repo_root/scripts/start-ngrok-auth.sh'"
    pages_pane_cmd="bash -lc $(printf '%q' "$pages_cmd")"
    backend_pane_cmd="bash -lc $(printf '%q' "$backend_cmd")"
    ngrok_pane_cmd="bash -lc $(printf '%q' "$ngrok_cmd")"

    if [ -n "${TMUX:-}" ]; then
      if tmux list-windows -F '#{window_name}' | grep -Fxq "$window_name"; then
        echo "tmux window '$window_name' already exists in the current session."
        exit 1
      fi

      window_id="$(tmux new-window -P -F '#{window_id}' -n "$window_name" -c "$repo_root" "$pages_pane_cmd")"
      attach_after=0
    else
      if tmux has-session -t "$session_name" 2>/dev/null; then
        if tmux list-windows -t "$session_name" -F '#{window_name}' | grep -Fxq "$window_name"; then
          echo "tmux window '$window_name' already exists in session '$session_name'."
          exit 1
        fi

        window_id="$(tmux new-window -P -F '#{window_id}' -t "$session_name:" -n "$window_name" -c "$repo_root" "$pages_pane_cmd")"
      else
        tmux new-session -d -s "$session_name" -n "$window_name" -c "$repo_root" "$pages_pane_cmd"
        window_id="$(tmux display-message -p -t "$session_name:$window_name" '#{window_id}')"
      fi

      attach_after=1
    fi

    tmux split-window -h -t "$window_id" -c "$repo_root" "$backend_pane_cmd"
    tmux split-window -v -t "${window_id}.1" -c "$repo_root" "$ngrok_pane_cmd"
    tmux select-layout -t "$window_id" main-vertical >/dev/null

    tmux select-window -t "$window_id"
    tmux select-pane -t "${window_id}.0"

    if [ "$attach_after" -eq 1 ]; then
      tmux attach-session -t "$session_name"
    fi
