import re, json
from playwright.sync_api import sync_playwright
BASE="http://localhost:3101"
SLUG="/blog/how-to-get-your-kid-off-video-games-without-a-fight"
EV="/home/claude/ekuzo-web/docs/session-end-post/evidence/sentry"
BLOCK=re.compile(r"google-analytics\.com|googletagmanager\.com|clarity\.ms|facebook\.com/tr|connect\.facebook\.net|doubleclick\.net|facebook\.net|analytics\.google\.com")
BEACONS=[]
def guard(ctx, label=""):
    def h(route):
        u=route.request.url
        BEACONS.append(f"{label} {route.request.method} {u}")
        route.fulfill(status=204, body="")
    ctx.route(BLOCK, h)
def launch(p):
    # second layer: browser-level host resolver blackhole so closing-page beacons cannot leave
    return p.chromium.launch(args=["--host-resolver-rules=MAP *.google-analytics.com ~NOTFOUND, MAP *.googletagmanager.com ~NOTFOUND, MAP *.clarity.ms ~NOTFOUND, MAP www.facebook.com ~NOTFOUND, MAP connect.facebook.net ~NOTFOUND, MAP *.doubleclick.net ~NOTFOUND, MAP *.analytics.google.com ~NOTFOUND"])
def flush(mode="w"):
    open(f"{EV}/beacons.txt",mode).write("\n".join(BEACONS)+"\n")
