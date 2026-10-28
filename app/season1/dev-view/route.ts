import { currentMode } from "@/lib/season1/mode";
import { devViewTarget } from "@/lib/season1/devView";

// Dev previews only: shows a Season 01 page inside a 390px phone frame so it can be
// reviewed at phone size without resizing the browser. Opened from the Phone / Desktop
// switch in the yellow test-mode bar (public/js/s1-devview.js). 404 outside test mode.
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  if (currentMode(request.headers.get("host")) !== "test") {
    return new Response("Not found", { status: 404 });
  }
  const target = devViewTarget(new URL(request.url).searchParams.get("u"));
  const json = JSON.stringify(target).replace(/</g, "\\u003c");
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow">
<title>Phone preview · Season 01</title>
<style>
html,body{margin:0;height:100%;background:#1f1f1f;font:600 12px/1.4 Inter,Arial,sans-serif}
.top{height:44px;display:flex;align-items:center;justify-content:center;gap:12px;background:#fff6b6;color:#7a5a00}
.dv{display:inline-flex;border:1px solid #7a5a00}
.dv button{font:700 11px/1 Inter,Arial,sans-serif;padding:5px 10px;background:transparent;color:#7a5a00;border:0;cursor:pointer}
.dv button[aria-pressed=true]{background:#7a5a00;color:#fff6b6}
.stage{height:calc(100% - 44px);display:flex;align-items:center;justify-content:center}
iframe{width:390px;height:min(844px,calc(100vh - 76px));border:0;border-radius:28px;background:#fff;box-shadow:0 0 0 10px #000}
</style></head><body>
<div class="top"><span>Test mode. Phone preview, 390px.</span><span class="dv" role="group" aria-label="Preview size"><button type="button" aria-pressed="true">Phone</button><button type="button" id="desk" aria-pressed="false">Desktop</button></span></div>
<div class="stage"><iframe id="f" title="Phone preview"></iframe></div>
<script>
(function(){var t=${json},f=document.getElementById("f");f.src=t;
function cur(){try{var l=f.contentWindow.location;return l.pathname+l.search+l.hash}catch(e){return t}}
f.addEventListener("load",function(){var c=cur();if(c&&c!=="about:blank")history.replaceState(null,"","/season1/dev-view?u="+encodeURIComponent(c));});
document.getElementById("desk").addEventListener("click",function(){location.href=cur()||t;});})();
</script></body></html>`;
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" },
  });
}
