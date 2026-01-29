#!/bin/bash
# CHRONOS AI Agent - GitHub Tools

export HOME="${HOME:-/workspaces/v0-crypto-dashboard-design}"

search_code() { gh search code "$1" --repo $(gh repo view --json nameWithOwner -q .nameWithOwner); }
list_prs() { gh pr list --state open; }
list_issues() { gh issue list --state open; }
repo_info() { gh repo view; }
run_model() { gh models run "$1" "$2"; }

case "${1:-help}" in
    search) search_code "$2" ;;
    prs) list_prs ;;
    issues) list_issues ;;
    repo) repo_info ;;
    model) run_model "$2" "$3" ;;
    *) echo "Uso: $0 {search|prs|issues|repo|model}" ;;
esac
