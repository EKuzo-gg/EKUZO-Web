// Season 01 dev previews only: adds a Phone / Desktop switch to the yellow test-mode bar.
// The bar only renders in test mode, so this never shows on the live site.
(function () {
  if (window.self !== window.top) return; // already inside the phone frame
  function mount() {
    var bar = document.querySelector(".pv");
    if (!bar || bar.hidden || bar.querySelector(".dv")) return;
    if (!document.getElementById("dv-css")) {
      var st = document.createElement("style");
      st.id = "dv-css";
      st.textContent = ".dv{display:inline-flex;margin-left:12px;vertical-align:middle;border:1px solid #7a5a00}" +
        ".dv button{font:700 11px/1 Inter,Arial,sans-serif;padding:5px 10px;background:transparent;color:#7a5a00;border:0;cursor:pointer}" +
        ".dv button[aria-pressed=true]{background:#7a5a00;color:#fff6b6}";
      document.head.appendChild(st);
    }
    var w = document.createElement("span");
    w.className = "dv";
    w.setAttribute("role", "group");
    w.setAttribute("aria-label", "Preview size");
    w.innerHTML = '<button type="button" data-v="phone" aria-pressed="false">Phone</button><button type="button" data-v="desktop" aria-pressed="true">Desktop</button>';
    w.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (b && b.getAttribute("data-v") === "phone")
        location.href = "/season1/dev-view?u=" + encodeURIComponent(location.pathname + location.search + location.hash);
    });
    bar.appendChild(w);
  }
  window.s1DevView = mount;
  if (document.readyState !== "loading") mount();
  else document.addEventListener("DOMContentLoaded", mount);
})();
