---
date: 2026-11-09
slug: next-start-by-binary-and-child-pid
source: ekuzo-web Build Loop run docs/s1-cls-field-2026-11 (Chronos and Sentry lanes)
target: company/agents/agent-loop/build-loop.md § Servers in a brief: start and stop by PID
status: pending
---

# Lesson: start `next` from its binary, and stop the child too

## What happened

The brief line `npx next start -p 3100 > server.log 2>&1 & echo $! > .server.pid` saves the PID of
the `npx` wrapper. `kill "$(cat .server.pid)"` ends the wrapper and leaves a `next-server` child
holding the port. Two lanes found the child with `fuser 3100/tcp` (6076 on 3102, 15770 on 3101) and
killed it after checking `/proc/<pid>/cwd`. `ss` is not installed in the cloud container. One lane
also committed `server-3100.log` and two pid files by mistake (removed in `bfc0eeb`).

## Candidate prose (replace the two start and stop lines in the section)

A brief whose builders start a local server includes the start and stop lines verbatim:
`./node_modules/.bin/next start -p 3100 > server-3100.log 2>&1 & echo $! > .server-3100.pid` and
`kill "$(cat .server-3100.pid)"`, then `fuser 3100/tcp` to find any `next-server` child still
holding the port (check its `/proc/<pid>/cwd` is the lane's worktree before killing it; `ss` is not
installed in the cloud container, `/proc/net/tcp` works too). `npx next start` saves the wrapper's
PID and leaves the child behind. One port per lane, one worktree per server, and a lane never
rebuilds a worktree another lane is serving from. `.server-*.pid` and `server-*.log` go in
`.gitignore` in the lane's first commit. Never `pkill -f` or `ps | grep` by command words; they
match the calling shell (`environment-notes.md` § Stop servers by PID; 2026-10-26 twice,
2026-10-27 once, 2026-11-09 the child case).
