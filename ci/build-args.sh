#!/bin/sh
# Read `.vault-build-args` (key=value lines, snake_case keys) and print
# Kaniko `--build-arg PUBLIC_*=...` flags to stdout. Quoting is applied
# so values with spaces / special chars survive `$(…)`. Runs in the
# `build-push` Woodpecker step; called as:
#
#   /kaniko/executor ... $(sh ci/build-args.sh) ...

set -eu

if [ ! -f .vault-build-args ]; then
  exit 0
fi

while IFS='=' read -r k v; do
  case "$k" in
    goquest_key)      key=PUBLIC_GOQUEST_KEY ;;
    cs_workspace_id)  key=PUBLIC_CS_WORKSPACE_ID ;;
    cs_project_web)   key=PUBLIC_CS_PROJECT_WEB ;;
    gopedia_key)      key=PUBLIC_GOPEDIA_KEY ;;
    *) continue ;;
  esac
  # Kaniko accepts --build-arg KEY=VALUE; we keep KEY=VALUE as a single arg.
  printf -- '--build-arg %s=%s ' "$key" "$v"
done < .vault-build-args
