#!/bin/sh
# Fetch helpdesk PUBLIC_* values from Vault and write `.vault-build-args`,
# one `key=value` line per field. Runs inside the `vault-fetch` Woodpecker
# step. Missing fields stay empty so the widget can degrade gracefully.
#
# Why a script? Woodpecker pre-substitutes `${VAR}` patterns in YAML
# `commands:` bodies BEFORE the container starts, which mangles in-loop
# shell variables (see neunexus runbook §"variable pre-substitution").
# Running this file via `sh ci/vault-fetch.sh` bypasses that preprocessor.

set -eu

: > .vault-build-args

for f in goquest_key cs_workspace_id cs_project_web gopedia_key; do
  val=$(vault kv get -field="$f" secret/toji-homes/helpdesk 2>/dev/null || echo "")
  printf '%s=%s\n' "$f" "$val" >> .vault-build-args
done

# Diagnostic: log which fields landed (without leaking values).
awk -F= '{ if (length($2) > 0) print $1": set"; else print $1": empty" }' .vault-build-args
