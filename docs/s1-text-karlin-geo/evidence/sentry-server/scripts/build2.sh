#!/bin/bash
# usage: build2.sh <worktree dir> <out file>
cd "$1"
export KLAVIYO_PRIVATE_API_KEY=dummy-sentry META_CAPI_ACCESS_TOKEN=dummy-sentry META_PIXEL_ID=000000000000000 SENTRY_STUB_LOG=/dev/null NEXT_TELEMETRY_DISABLED=1
export STRIPE_SECRET_KEY=sk_test_dummy-sentry
export NODE_OPTIONS="--import=$(dirname "$0")/../stub-preload.mjs"
npx next build > "$2" 2>&1
echo "exit $?" >> "$2"
