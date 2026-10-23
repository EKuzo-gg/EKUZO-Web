#!/bin/bash
cd /sessions/rcw-01fngqtzox41mkxtnds4xleg/mnt/ekuzo-web/.claude/worktrees/s1-text-karlin-geo
export KLAVIYO_PRIVATE_API_KEY=dummy-sentry META_CAPI_ACCESS_TOKEN=dummy-sentry META_PIXEL_ID=000000000000000 SENTRY_STUB_LOG=/dev/null NEXT_TELEMETRY_DISABLED=1
export NODE_OPTIONS="--import=/sessions/rcw-01fngqtzox41mkxtnds4xleg/mnt/ekuzo-web/.claude/worktrees/s1-text-karlin-geo/docs/s1-text-karlin-geo/evidence/sentry-server/stub-preload.mjs"
npx next build > /sessions/rcw-01fngqtzox41mkxtnds4xleg/mnt/ekuzo-web/.claude/worktrees/s1-text-karlin-geo/docs/s1-text-karlin-geo/evidence/sentry-server/n7-branch-build-full.txt 2>&1
echo "exit $?" >> /sessions/rcw-01fngqtzox41mkxtnds4xleg/mnt/ekuzo-web/.claude/worktrees/s1-text-karlin-geo/docs/s1-text-karlin-geo/evidence/sentry-server/n7-branch-build-full.txt
