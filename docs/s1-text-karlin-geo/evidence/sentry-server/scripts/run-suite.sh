#!/bin/bash
# usage: run-suite.sh <suites csv> <tag>; starts baseline(3101) and branch(3102) next dev with stub, runs harness (incl. positive control), stops servers.
W=$HOME/mnt/ekuzo-web/.claude/worktrees
E=$W/s1-text-karlin-geo/docs/s1-text-karlin-geo/evidence/sentry-server
S=$1; T=$2
mkdir -p $E/runs
rm -f $E/runs/log-baseline-$T.jsonl $E/runs/log-branch-$T.jsonl
start(){ # name dir port
  ( cd $2 && env KLAVIYO_PRIVATE_API_KEY=dummy-sentry META_CAPI_ACCESS_TOKEN=dummy-sentry META_PIXEL_ID=000000000000000 STRIPE_SECRET_KEY=sk_test_dummy-sentry \
      SENTRY_STUB_LOG=$E/runs/log-$1-$T.jsonl NEXT_TELEMETRY_DISABLED=1 NODE_OPTIONS="--import=$E/stub-preload.mjs" \
      npx next ${MODE:-dev} -p $3 > $E/runs/server-$1-$T.log 2>&1 & echo $! > $E/runs/$1-$T.pid )
}
start baseline $W/s1-tkg-baseline 3101
start branch $W/s1-text-karlin-geo 3102
for i in $(seq 1 60); do
  curl -s -o /dev/null -m 2 localhost:3101 -X OPTIONS && curl -s -o /dev/null -m 2 localhost:3102 -X OPTIONS && break; sleep 1
done
echo "servers up after ~${i}s"
node $E/scripts/harness.mjs http://localhost:3101 $E/runs/log-baseline-$T.jsonl $E/runs/res-baseline-$T.json $S &
P1=$!
node $E/scripts/harness.mjs http://localhost:3102 $E/runs/log-branch-$T.jsonl $E/runs/res-branch-$T.json $S &
P2=$!
wait $P1; echo "baseline harness rc=$?"; wait $P2; echo "branch harness rc=$?"
for n in baseline branch; do pkill -P $(cat $E/runs/$n-$T.pid) 2>/dev/null; kill $(cat $E/runs/$n-$T.pid) 2>/dev/null; done
pkill -f "next[ ]dev" 2>/dev/null; pkill -f "next-serve[r]" 2>/dev/null; sleep 1
echo "leftover:"; ps -ef | grep -E "next|node" | grep -v grep | grep -v "ps -ef" | head
