#!/usr/bin/env bash
# guard-pattern-kill.sh: a Claude Code PreToolUse hook that refuses pattern-based process kills.
#
# Why: `pkill -f`, `pgrep -f` and `ps | grep ... | kill` match the shell running the command and kill
# the tool call itself (2026-10-26 twice, 2026-10-27, 2026-11-05). Stop servers by the PID saved at
# start instead: company/agents/agent-loop/build-loop.md § Servers in a brief.
# Added 2026-11-07 from system/loops/lessons-pending/_archive/2026-11-07-guard-against-pattern-kill.md,
# approved live by Jamie in the 2026-W45 learning-loop review ("approve all").
#
# Install: copy to scripts/guard-pattern-kill.sh in the repo, chmod +x, and add to .claude/settings.json:
#   {"hooks": {"PreToolUse": [{"matcher": "Bash",
#     "hooks": [{"type": "command", "command": "bash scripts/guard-pattern-kill.sh"}]}]}}
#
# Exit 2 blocks the call and shows stderr to the agent; exit 0 lets it run.
python3 -c '
import json, re, sys
try:
    cmd = json.load(sys.stdin).get("tool_input", {}).get("command", "") or ""
except Exception:
    sys.exit(0)
bad = (re.search(r"\bpkill\b[^|;&]*\s-[a-zA-Z]*f", cmd)
       or re.search(r"\bpgrep\b[^|;&]*\s-[a-zA-Z]*f", cmd)
       or (re.search(r"\bps\b[^|]*\|\s*grep", cmd) and re.search(r"\bkill\b", cmd)))
if bad:
    sys.stderr.write("Blocked: pattern kills match the calling shell. Start with "
        "`... > server.log 2>&1 & echo $! > .server.pid` and stop with `kill \"$(cat .server.pid)\"`.\n")
    sys.exit(2)
sys.exit(0)
'
