import fs from "node:fs";
const B = "http://localhost:3311", P = "/blog/gaming-study-13-7-years-younger-what-it-means-for-kids";
const res = await fetch(B + P); const html = await res.text();
const out = [`HEAD AND SCHEMA ${new Date().toISOString()}`, `GET ${P} -> ${res.status} ${res.headers.get("content-type")} ${Buffer.byteLength(html)} bytes`];
const meta = (re) => { const m = html.match(re); return m ? m[1] : "(absent)"; };
const attr = (key, val) => { const re = new RegExp(`<meta[^>]*(?:${key})="${val}"[^>]*>`, "i"); const m = html.match(re); if (!m) return "(absent)"; const c = m[0].match(/content="([^"]*)"/i); return c ? c[1] : "(no content)"; };
out.push("title: " + meta(/<title[^>]*>([^<]*)<\/title>/i));
out.push("meta description: " + attr("name", "description"));
out.push("canonical: " + meta(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/i));
out.push("robots: " + attr("name", "robots"));
out.push("og:image: " + attr("property", "og:image"));
out.push("twitter:image: " + attr("name", "twitter:image"));
out.push("og:title: " + attr("property", "og:title"));
out.push("og:type: " + attr("property", "og:type"));
out.push("article:published_time: " + attr("property", "article:published_time"));
out.push("article:modified_time: " + attr("property", "article:modified_time"));
const blocks = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
out.push(`JSON-LD blocks: ${blocks.length}`);
const walk = (n, depth = 0) => { if (Array.isArray(n)) return n.forEach(x => walk(x, depth)); if (n && typeof n === "object") { if (n["@type"]) { const t = [].concat(n["@type"]).join("/"); const extra = ["datePublished", "dateModified", "image"].filter(k => k in n).map(k => `${k}=${JSON.stringify(n[k]).slice(0, 160)}`).join(" "); if (extra || ["Article", "BlogPosting", "FAQPage", "Question", "BreadcrumbList"].includes(t)) out.push(`  ${t}${n.name ? " name=" + JSON.stringify(n.name).slice(0,140) : ""} ${extra}`); } Object.values(n).forEach(v => walk(v, depth + 1)); } };
blocks.forEach((b, i) => { out.push(`block ${i}:`); try { walk(JSON.parse(b)); } catch (e) { out.push("  PARSE ERROR " + e.message); } });
out.push("");
for (const a of ["/images/gaming-study-13-7-hero.jpg", "/images/gaming-study-13-7-card.jpg", "/images/gaming-study-same-game-two-hours.png"]) { const r = await fetch(B + a); const b = await r.arrayBuffer(); out.push(`${a} -> ${r.status} ${r.headers.get("content-type")} ${b.byteLength} bytes`); }
out.push("h1 count: " + (html.match(/<h1[\b>\s]/g) || []).length);
const text = html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
const near = [...text.matchAll(/.{0,80}(Updated|Published)[^.]{0,60}20\d\d.{0,40}/g)].map(m => m[0]);
out.push("visible date text near byline: " + (near.slice(0, 3).join(" || ") || "(not found)"));
for (const f of ["/sitemap.xml", "/llms.txt"]) { const r = await fetch(B + f); const t = await r.text(); out.push(`${f} -> ${r.status}; contains slug: ${t.includes("gaming-study-13-7-years-younger-what-it-means-for-kids")}`); }
fs.writeFileSync(process.argv[2], out.join("\n") + "\n"); console.log(out.join("\n"));
