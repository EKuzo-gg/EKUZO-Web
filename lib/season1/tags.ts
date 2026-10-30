import { isLiveHost, type S1Mode } from "./mode";
import { LC_COOKIE, LC_KEYS, parseLastClick, readCookie } from "./attribution";

/**
 * Season 01 head tags (analytics spec S1 to S4, resolution C9 to C14, P1, P4).
 * One renderer for every Season 01 HTML page; templates carry `{{URL_ALLOW}}`
 * then `{{TAGS}}` in the head and their route handlers fill both here.
 *
 * - Live tags only when the raw Host is ekuzo.gg or www.ekuzo.gg AND the commit
 *   mode is not "test" (mode "off" still measures). A missing host is non-live.
 * - Any other host renders only the QA gate: nothing loads unless `?s1qa=1` was
 *   seen in this browser session (cookie `s1_qa`). In QA mode every GA4 event
 *   carries debug_mode, ad consent defaults to denied, Google signals and ad
 *   personalization are off, and the Pixel's Purchase and InitiateCheckout go
 *   out as S1QA_ custom events (P4) so test buys never count.
 * - Force-static pages (landing, thanks) cannot see the Host, so they get one
 *   script that applies the same rule from location.hostname in the browser.
 *
 * Pages call `window.s1px(event, params, eventID)` for Pixel conversions and
 * `window.s1once(key)` for once-per-order guards (localStorage plus a cookie).
 * Both exist only when tags are on; callers check for them.
 */

export const GA4_ID = "G-8LM45PX53W";
export const PIXEL_ID = "1284038230557204";
export const CLARITY_ID = "wml8wll5ua";
export const QA_PARAM = "s1qa";
export const QA_COOKIE = "s1_qa";

export const GTAG_URL = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
export const FBEVENTS_URL = "https://connect.facebook.net/en_US/fbevents.js";
export const CLARITY_URL = "https://www.clarity.ms/tag/";

export type TagPage = "join" | "signup" | "welcome" | "crew" | "thanks" | "landing";
export type DynamicPage = "join" | "signup" | "welcome" | "crew";
export type StaticPage = "thanks" | "landing";

/** P1 (Jamie, open): Clarity pages. Flip one value here. Never crew (family code in the path, C9). */
export const CLARITY_PAGES: Record<TagPage, boolean> = {
  join: true,
  signup: true,
  welcome: true,
  thanks: true,
  landing: true,
  crew: false,
};

/**
 * Crew (`/crew/<family code>`) renders NO vendor tags this release: no GA4, no Pixel, no Clarity, live or QA.
 * Why: the Google tag G-8LM45PX53W has a linked Google Ads destination (AW-18509911105) whose ccm/collect hits
 * read document.location, ignoring page_location (set or config) and send_to on its own page_view. Measured on
 * 10-30 (evidence/atlas-frontend.md, round 3): crew sent dl=/crew/<code> to Google Ads, which breaks the
 * must-not. Turn GA4 back on (GA4 only, /crew/ location, signals off, events send_to GA4) by setting this to
 * true once Jamie has unlinked the Ads destination from the Google tag and a branch run shows no ccm/collect.
 */
export const CREW_GA4 = false;

/** P4 (Jamie, open): in QA mode, Purchase and InitiateCheckout become S1QA_ custom events. */
export const QA_RENAME_CONVERSIONS = true;

/** Address bar allow list (C10): the eight kept parameters plus src and s1qa. */
export const URL_ALLOW_KEYS: readonly string[] = [...LC_KEYS, "src", QA_PARAM];

interface PageSpec {
  /** GA4 page_location: kept params on this path, the /crew/ override, or GA's own (landing). */
  gaLocation: "kept" | "crew" | "plain";
  signalsOff: boolean;
  referrerOrigin: boolean;
  pixel: boolean;
  /** Welcome: one PageView per order (the pending state refreshes every 4 s). */
  pageViewOncePerOrder: boolean;
  viewContent: boolean;
  /** Clarity custom tags page, src, utm_campaign, utm_content (the landing sets its own). */
  clarityTags: boolean;
}

const PAGES: Record<TagPage, PageSpec> = {
  join: { gaLocation: "kept", signalsOff: false, referrerOrigin: false, pixel: true, pageViewOncePerOrder: false, viewContent: true, clarityTags: true },
  signup: { gaLocation: "kept", signalsOff: false, referrerOrigin: false, pixel: true, pageViewOncePerOrder: false, viewContent: false, clarityTags: true },
  welcome: { gaLocation: "kept", signalsOff: false, referrerOrigin: true, pixel: true, pageViewOncePerOrder: true, viewContent: false, clarityTags: true },
  crew: { gaLocation: "crew", signalsOff: true, referrerOrigin: false, pixel: false, pageViewOncePerOrder: false, viewContent: false, clarityTags: false },
  thanks: { gaLocation: "kept", signalsOff: false, referrerOrigin: false, pixel: false, pageViewOncePerOrder: false, viewContent: false, clarityTags: true },
  landing: { gaLocation: "plain", signalsOff: false, referrerOrigin: false, pixel: true, pageViewOncePerOrder: false, viewContent: false, clarityTags: false },
};

/** JSON safe inside an inline <script>. */
function js(v: unknown): string {
  return JSON.stringify(v)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/** A Clarity tag value: printable ASCII, at most 100, never an email or a long digit run (codes). */
export function okClarityValue(v: unknown): v is string {
  return typeof v === "string" && /^[\x20-\x7e]{1,100}$/.test(v) && !v.includes("@") && !/^\d{6,}$/.test(v);
}

const OK_JS = String.raw`function(v){return typeof v==='string'&&/^[\x20-\x7e]{1,100}$/.test(v)&&v.indexOf('@')<0&&!/^\d{6,}$/.test(v)}`;

const ONCE_JS = String.raw`w.s1once=function(k){if(!/^[A-Za-z0-9_-]{1,80}$/.test(k))return false;var s=false;try{s=!!w.localStorage.getItem(k)}catch(e){}if(!s){try{s=(' '+d.cookie.replace(/;\s*/g,' ')+' ').indexOf(' '+k+'=1 ')>=0}catch(e){}}if(s)return false;try{w.localStorage.setItem(k,'1')}catch(e){}try{d.cookie=k+'=1; Path=/season1; Max-Age=31536000; SameSite=Lax'+(location.protocol==='https:'?'; Secure':'')}catch(e){}return true};`;

/** The tag setup for one page, live or QA. Runs synchronously in the head. */
function coreJs(page: TagPage, qa: boolean, fallback: Record<string, string>, orderRef: string): string {
  const p = PAGES[page];
  const out: string[] = ["var w=window,d=document;", ONCE_JS];

  // GA4
  out.push("w.dataLayer=w.dataLayer||[];var push=function(){w.dataLayer.push(arguments)};");
  // QA: every event carries debug_mode (the GA4 Developer traffic filter drops them). Crew: every event goes to
  // GA4 only (send_to), so the Google tag's linked Ads destination does not mirror crew events, whose hits read
  // the real URL with the family code (Sentry phase 4; measured: send_to stops the event hits).
  const extra = [qa ? "x.debug_mode=true;" : "", p.gaLocation === "crew" ? `x.send_to=${js(GA4_ID)};` : ""].join("");
  if (extra) {
    out.push(`w.gtag=function(a,b,c){if(a==='event'){var x={},k;if(c)for(k in c)x[k]=c[k];${extra}return push(a,b,x)}return push.apply(null,arguments)};`);
  } else {
    out.push("w.gtag=push;");
  }
  out.push("gtag('js',new Date());");
  if (qa) out.push("gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});");
  out.push(
    `var q;try{q=new URLSearchParams(location.search)}catch(e){q={get:function(){return null}}}var K=${js(LC_KEYS)},o=[],i,v;for(i=0;i<K.length;i++){v=q.get(K[i]);if(v!==null)o.push(encodeURIComponent(K[i])+'='+encodeURIComponent(v))}var qs=o.length?'?'+o.join('&'):'';`,
  );
  // Sentry phase 4 (round 3): the Google tag's linked Ads destination (AW-18509911105) reads the page URL itself,
  // not GA4's per-config page_location, so crew sent /crew/<family code> to Google Ads. gtag('set') before config
  // applies the cleaned location and referrer to every destination of the tag. Per-config values stay as well.
  if (p.gaLocation === "kept") out.push("var L=location.origin+location.pathname+qs;");
  if (p.gaLocation === "crew") out.push("var L=location.origin+'/crew/'+qs;");
  if (p.gaLocation === "plain") out.push("var L=location.origin+location.pathname+location.search;");
  out.push(
    p.referrerOrigin
      ? "var rf=location.origin;"
      : "var rf='';try{rf=d.referrer?new URL(d.referrer).origin:''}catch(e){}",
  );
  out.push("var S={page_location:L};if(rf)S.page_referrer=rf;gtag('set',S);");
  out.push("var c={};");
  if (p.gaLocation !== "plain") out.push("c.page_location=L;");
  if (p.signalsOff || qa) out.push("c.allow_google_signals=false;c.allow_ad_personalization_signals=false;");
  if (qa) out.push("c.debug_mode=true;");
  if (p.referrerOrigin) out.push("c.page_referrer=location.origin;");
  out.push(`gtag('config',${js(GA4_ID)},c);`);

  // Meta Pixel: autoConfig off BEFORE init (C11), so no button text or form scraping.
  if (p.pixel) {
    out.push(
      `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(w,d,'script',${js(FBEVENTS_URL)});`,
    );
    out.push(`fbq('set','autoConfig',false,${js(PIXEL_ID)});`);
    out.push(`fbq('init',${js(PIXEL_ID)});`);
    if (qa && QA_RENAME_CONVERSIONS) {
      out.push("w.s1px=function(ev,p,id){try{var x=id?{eventID:id}:{};if(ev==='Purchase'||ev==='InitiateCheckout')fbq('trackCustom','S1QA_'+ev,p||{},x);else fbq('track',ev,p||{},x)}catch(e){}};");
    } else {
      out.push("w.s1px=function(ev,p,id){try{fbq('track',ev,p||{},id?{eventID:id}:{})}catch(e){}};");
    }
    if (p.pageViewOncePerOrder) {
      out.push(`var R=${js(orderRef)};if(!R||w.s1once('s1_pxpv_'+R))fbq('track','PageView');`);
    } else {
      out.push("fbq('track','PageView');");
    }
    if (p.viewContent) out.push("fbq('track','ViewContent',{content_name:'Season 01'});");
  }

  // Microsoft Clarity (P1). Typed inputs are masked by Clarity; kid names carry data-clarity-mask.
  if (CLARITY_PAGES[page]) {
    out.push(
      `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src=${js(CLARITY_URL)}+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(w,d,'clarity','script',${js(CLARITY_ID)});`,
    );
    if (p.clarityTags) {
      out.push(
        `var F=${js(fallback)},ok=${OK_JS},T={page:${js(page)}};['src','utm_campaign','utm_content'].forEach(function(k){var x=q.get(k)||F[k];if(ok(x))T[k]=x});for(var tk in T)clarity('set',tk,T[tk]);`,
      );
    }
  }
  return `(function(){${out.join("")}})();`;
}

const GTAG_LOADER_JS = `var g=document.createElement('script');g.async=true;g.src=${js(GTAG_URL)};(document.head||document.documentElement).appendChild(g);`;

/** Sets or clears the session QA cookie from ?s1qa=1 / ?s1qa=0, then reads it into `qa`. */
const QA_GATE_JS = String.raw`var qa=false;try{var m=/(?:^|&)s1qa=([01])(?:&|$)/.exec(location.search.slice(1)),sec=location.protocol==='https:'?'; Secure':'';if(m)document.cookie=m[1]==='1'?'s1_qa=1; Path=/; SameSite=Lax'+sec:'s1_qa=; Path=/; Max-Age=0; SameSite=Lax'+sec;qa=/(?:^|;\s*)s1_qa=1(?:;|$)/.test(document.cookie)}catch(e){}if(!qa)return;`;

const QA_MARK = "/* s1 QA gate: tags load only after ?s1qa=1 (test deploys) */";

export function tagsAreLive(host: string | null | undefined, mode: S1Mode): boolean {
  return isLiveHost(host) && mode !== "test";
}

/** Clarity fallback tags from the last-click cookie (the sign-up URL carries only src). */
export function clarityFallback(cookieHeader: string | null | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    const lc = parseLastClick(readCookie(cookieHeader, LC_COOKIE));
    if (lc) {
      if (okClarityValue(lc.utm_campaign)) out.utm_campaign = lc.utm_campaign;
      if (okClarityValue(lc.utm_content)) out.utm_content = lc.utm_content;
    }
  } catch {
    // no fallback
  }
  return out;
}

export interface TagOptions {
  /** The raw Host request header (never x-forwarded-host). */
  host: string | null | undefined;
  mode: S1Mode;
  page: DynamicPage;
  /** Welcome: the order public id (once-per-order PageView). */
  orderRef?: string | null;
  /** The request's Cookie header (Clarity fallback tags). */
  cookie?: string | null;
  /** Crew GA4 switch; defaults to CREW_GA4 (tests pass true to check the re-enable path). */
  crewGa4?: boolean;
}

/** Head tags for a route-rendered page. */
export function renderTags(o: TagOptions): string {
  // Crew: nothing at all, not even the QA gate, until CREW_GA4 is turned back on (see the constant).
  if (o.page === "crew" && !(o.crewGa4 ?? CREW_GA4)) return "";
  const ref = o.orderRef && /^[A-Za-z0-9_-]{1,64}$/.test(o.orderRef) ? o.orderRef : "";
  const fb = CLARITY_PAGES[o.page] && PAGES[o.page].clarityTags ? clarityFallback(o.cookie) : {};
  if (tagsAreLive(o.host, o.mode)) {
    return `<script async src="${GTAG_URL}"></script>\n<script>${coreJs(o.page, false, fb, ref)}</script>`;
  }
  return `<script>${QA_MARK}(function(){${QA_GATE_JS}${GTAG_LOADER_JS}${coreJs(o.page, true, fb, ref)}})();</script>`;
}

/** Head tags for a force-static page: the same host rule, applied in the browser (C12). */
export function renderStaticTags(page: StaticPage): string {
  return `<script>${QA_MARK}(function(){if(/^(?:www\\.)?ekuzo\\.gg$/i.test(location.hostname)){${GTAG_LOADER_JS}${coreJs(page, false, {}, "")}return}${QA_GATE_JS}${GTAG_LOADER_JS}${coreJs(page, true, {}, "")}})();</script>`;
}

/**
 * Address bar allow list (C10). Runs in the head before the tags: keeps the
 * kept parameters plus src and s1qa (and any page extras, e.g. thanks' play),
 * drops everything else with replaceState so no tag ever reads it.
 */
export function renderUrlAllow(extraKeys: readonly string[] = []): string {
  const keys = [...URL_ALLOW_KEYS, ...extraKeys];
  return `<script>try{(function(){var K=${js(keys)},u=new URL(location.href),o=new URLSearchParams(),c=0,h=u.hash;u.searchParams.forEach(function(v,k){if(K.indexOf(k)<0)c=1;else o.append(k,v)});if(h&&!/^#[A-Za-z0-9_-]{0,64}$/.test(h)){h='';c=1}if(c){var s=o.toString();history.replaceState(history.state,'',u.pathname+(s?'?'+s:'')+h)}})()}catch(e){}</script>`;
}

/** Fills `{{URL_ALLOW}}` and `{{TAGS}}` (split/join: no `$` replacement patterns). */
export function fillTags(html: string, allow: string, tags: string): string {
  return html.split("{{URL_ALLOW}}").join(allow).split("{{TAGS}}").join(tags);
}

/** Route helper: both head blocks for a dynamic page from its request. */
export function tagsForRequest(
  request: Request,
  page: DynamicPage,
  mode: S1Mode,
  orderRef?: string | null,
): { allow: string; tags: string } {
  return {
    allow: renderUrlAllow(),
    tags: renderTags({ host: request.headers.get("host"), mode, page, orderRef, cookie: request.headers.get("cookie") }),
  };
}
