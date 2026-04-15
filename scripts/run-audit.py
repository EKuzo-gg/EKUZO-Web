#!/usr/bin/env python3
"""
EKUZO GEO audit driver. Runs schema, citability, crawlers, and llms.txt
checks for a list of URLs and writes markdown reports into reports/<date>/.

Usage: python3 scripts/run-audit.py [base_url]
Default base_url: https://ekuzo.gg
"""

import json
import sys
import subprocess
import datetime
import pathlib
import urllib.request
import urllib.error

SKILL_DIR = pathlib.Path.home() / ".claude/skills/geo/scripts"
FETCH = SKILL_DIR / "fetch_page.py"
CITABILITY = SKILL_DIR / "citability_scorer.py"
LLMSTXT = SKILL_DIR / "llmstxt_generator.py"

AI_CRAWLERS = [
    "GPTBot",
    "ClaudeBot",
    "Claude-Web",
    "PerplexityBot",
    "Google-Extended",
    "Applebot-Extended",
    "Bingbot",
    "CCBot",
]


def run_json(script, *args):
    out = subprocess.run(
        ["python3", str(script), *args],
        capture_output=True,
        text=True,
        check=True,
    )
    return json.loads(out.stdout)


def fetch_page(url):
    return run_json(FETCH, url, "page")


def score_citability(url):
    return run_json(CITABILITY, url)


def check_llmstxt(url):
    return run_json(LLMSTXT, url)


def fetch_robots(base_url):
    try:
        req = urllib.request.Request(
            base_url.rstrip("/") + "/robots.txt",
            headers={"User-Agent": "Mozilla/5.0 GEO-Audit"},
        )
        with urllib.request.urlopen(req, timeout=15) as r:
            return r.read().decode("utf-8", errors="replace"), r.status
    except urllib.error.HTTPError as e:
        return "", e.code
    except Exception as e:
        return f"ERROR: {e}", 0


# ---------- Schema scoring ----------

def score_schema(page):
    """Score an individual page's JSON-LD against the geo-schema rubric."""
    sd = page.get("structured_data") or []
    flat = []
    for block in sd:
        if isinstance(block, dict):
            if "@graph" in block and isinstance(block["@graph"], list):
                flat.extend(block["@graph"])
            else:
                flat.append(block)
        elif isinstance(block, list):
            flat.extend(block)

    types = []
    for node in flat:
        t = node.get("@type") if isinstance(node, dict) else None
        if isinstance(t, list):
            types.extend(t)
        elif t:
            types.append(t)

    has_type = lambda *names: any(t in names for t in types)

    score = 0
    breakdown = []

    # Organization/Person present
    org = next(
        (n for n in flat if isinstance(n, dict) and n.get("@type") in
         ("Organization", "EducationalOrganization", "LocalBusiness", "Corporation")),
        None,
    )
    person = next(
        (n for n in flat if isinstance(n, dict) and n.get("@type") == "Person"), None
    )
    entity = org or person
    if entity:
        has_core = all(entity.get(k) for k in ("name", "url", "logo"))
        pts = 15 if has_core and (entity.get("description") or entity.get("foundingDate")) else 10
    else:
        pts = 0
    score += pts
    breakdown.append(("Organization/Person schema present & complete", pts, 15))

    # sameAs
    sameas = []
    if entity and entity.get("sameAs"):
        sameas = entity["sameAs"] if isinstance(entity["sameAs"], list) else [entity["sameAs"]]
    pts = min(15, 3 * len(sameas))
    score += pts
    breakdown.append((f"sameAs links ({len(sameas)} found)", pts, 15))

    # Article with author
    article = next(
        (n for n in flat if isinstance(n, dict) and n.get("@type") in
         ("Article", "NewsArticle", "BlogPosting", "TechArticle")),
        None,
    )
    if article and isinstance(article.get("author"), dict) and article["author"].get("name"):
        pts = 10 if article["author"].get("sameAs") or article["author"].get("jobTitle") else 5
    else:
        pts = 0
    score += pts
    breakdown.append(("Article + author schema", pts, 10))

    # Business-type-specific
    btype_present = has_type("Course", "Product", "Service", "LocalBusiness", "SoftwareApplication")
    pts = 10 if btype_present else 0
    score += pts
    breakdown.append(("Business-type-specific schema (Course/Product/etc.)", pts, 10))

    # WebSite + SearchAction
    website = next((n for n in flat if isinstance(n, dict) and n.get("@type") == "WebSite"), None)
    pts = 5 if website and website.get("potentialAction") else (3 if website else 0)
    score += pts
    breakdown.append(("WebSite + SearchAction", pts, 5))

    # BreadcrumbList
    pts = 5 if has_type("BreadcrumbList") else 0
    score += pts
    breakdown.append(("BreadcrumbList", pts, 5))

    # JSON-LD format (always 5 since fetch_page only surfaces JSON-LD)
    pts = 5 if flat else 0
    score += pts
    breakdown.append(("JSON-LD format", pts, 5))

    # Server-rendered (fetch_page reads static HTML, so if present it's server-rendered)
    pts = 10 if flat else 0
    score += pts
    breakdown.append(("Server-rendered (not JS-injected)", pts, 10))

    # speakable
    pts = 5 if any(isinstance(n, dict) and n.get("speakable") for n in flat) else 0
    score += pts
    breakdown.append(("speakable property", pts, 5))

    # Valid JSON + types (basic — if nothing errored out parsing, 10; deduct if missing @context)
    if flat:
        missing_ctx = sum(1 for n in flat if isinstance(n, dict) and not n.get("@context") and "@graph" not in n)
        pts = 10 if missing_ctx == 0 else 5
    else:
        pts = 0
    score += pts
    breakdown.append(("Valid JSON + valid Schema.org types", pts, 10))

    # knowsAbout
    ka = (entity or {}).get("knowsAbout") if entity else None
    if isinstance(ka, list) and len(ka) >= 3:
        pts = 5
    elif ka:
        pts = 2
    else:
        pts = 0
    score += pts
    breakdown.append(("knowsAbout with 3+ topics", pts, 5))

    # No deprecated schemas
    deprecated = has_type("SpecialAnnouncement")
    pts = 0 if deprecated else 5
    score += pts
    breakdown.append(("No deprecated schemas", pts, 5))

    return {
        "score": score,
        "breakdown": breakdown,
        "types": types,
        "sameAs": sameas,
        "flat": flat,
    }


# ---------- Markdown writers ----------

def write_schema_report(out_dir, label, url, page, schema):
    md = []
    md.append(f"# Schema Audit — {label}")
    md.append(f"**URL:** {url}  ")
    md.append(f"**Date:** {datetime.date.today().isoformat()}  ")
    md.append("")
    md.append(f"## Schema Score: {schema['score']}/100")
    md.append("")
    md.append("## Detected @types")
    md.append("")
    if schema["types"]:
        for t in sorted(set(schema["types"])):
            md.append(f"- `{t}`")
    else:
        md.append("_No JSON-LD detected._")
    md.append("")
    md.append("## Score Breakdown")
    md.append("")
    md.append("| Criterion | Points | Max |")
    md.append("|---|---:|---:|")
    for name, pts, mx in schema["breakdown"]:
        md.append(f"| {name} | {pts} | {mx} |")
    md.append("")
    md.append("## sameAs Links")
    md.append("")
    if schema["sameAs"]:
        for s in schema["sameAs"]:
            md.append(f"- {s}")
    else:
        md.append("_None present._")
    md.append("")
    md.append("## Page Meta")
    md.append("")
    md.append(f"- Title: {page.get('title','')}")
    md.append(f"- Description: {page.get('description','')}")
    md.append(f"- Canonical: {page.get('canonical','')}")
    md.append(f"- Word count: {page.get('word_count',0)}")
    (out_dir / f"schema-{label}.md").write_text("\n".join(md))


def write_citability_report(out_dir, label, url, cit):
    md = []
    md.append(f"# Citability Audit — {label}")
    md.append(f"**URL:** {url}  ")
    md.append(f"**Date:** {datetime.date.today().isoformat()}  ")
    md.append("")
    md.append(f"## Citability Score: {cit.get('average_citability_score', 0)}/100")
    md.append("")
    md.append(f"- Total blocks analyzed: {cit.get('total_blocks_analyzed', 0)}")
    md.append(f"- Optimal length passages (134-167 words): {cit.get('optimal_length_passages', 0)}")
    md.append("")
    grade = cit.get("grade_distribution", {})
    md.append("## Grade Distribution")
    md.append("")
    md.append("| Grade | Count |")
    md.append("|---|---:|")
    for g in ["A", "B", "C", "D", "F"]:
        md.append(f"| {g} | {grade.get(g, 0)} |")
    md.append("")
    md.append("## Top 5 Most Citable Blocks")
    md.append("")
    for i, block in enumerate(cit.get("top_5_citable", []), 1):
        md.append(f"### {i}. {block.get('heading','(no heading)')} — Score {block.get('total_score',0)} ({block.get('grade','')})")
        md.append(f"- Words: {block.get('word_count',0)}")
        excerpt = block.get("text","")[:280].replace("\n"," ")
        if excerpt:
            md.append(f"- Excerpt: {excerpt}…")
        md.append("")
    md.append("## Bottom 5 Blocks (Improvement Targets)")
    md.append("")
    for i, block in enumerate(cit.get("bottom_5_citable", []), 1):
        md.append(f"### {i}. {block.get('heading','(no heading)')} — Score {block.get('total_score',0)} ({block.get('grade','')})")
        md.append(f"- Words: {block.get('word_count',0)}")
        excerpt = block.get("text","")[:280].replace("\n"," ")
        if excerpt:
            md.append(f"- Excerpt: {excerpt}…")
        md.append("")
    (out_dir / f"citability-{label}.md").write_text("\n".join(md))


def write_crawlers_report(out_dir, base_url, robots_text, robots_status):
    md = []
    md.append("# AI Crawlers Access Audit")
    md.append(f"**Site:** {base_url}  ")
    md.append(f"**Date:** {datetime.date.today().isoformat()}  ")
    md.append("")
    md.append(f"## robots.txt (HTTP {robots_status})")
    md.append("")
    md.append("```")
    md.append(robots_text.strip() or "(empty)")
    md.append("```")
    md.append("")
    md.append("## Crawler Access Map")
    md.append("")
    md.append("| Crawler | Status |")
    md.append("|---|---|")
    blocked_any = False
    text_lower = robots_text.lower()
    for bot in AI_CRAWLERS:
        bot_l = bot.lower()
        status = "Allowed (no specific rule)"
        if f"user-agent: {bot_l}" in text_lower:
            # Find block for this bot
            idx = text_lower.find(f"user-agent: {bot_l}")
            tail = text_lower[idx:idx+400]
            if "disallow: /" in tail and "disallow: /\n" in tail + "\n":
                status = "⚠️ BLOCKED"
                blocked_any = True
            else:
                status = "Allowed (explicit rule)"
        md.append(f"| {bot} | {status} |")
    md.append("")
    md.append(f"## Summary: {'⚠️ One or more AI crawlers blocked' if blocked_any else 'All major AI crawlers allowed.'}")
    (out_dir / "crawlers.md").write_text("\n".join(md))
    return blocked_any


def write_llmstxt_report(out_dir, base_url, result):
    md = []
    md.append("# llms.txt Audit")
    md.append(f"**Site:** {base_url}  ")
    md.append(f"**Date:** {datetime.date.today().isoformat()}  ")
    md.append("")
    md.append(f"## Status: {'Present' if result.get('exists') else 'ABSENT (404)'}")
    md.append("")
    md.append(f"- URL checked: {result.get('url')}")
    md.append(f"- Format valid: {result.get('format_valid')}")
    md.append(f"- Has title: {result.get('has_title')}")
    md.append(f"- Has description: {result.get('has_description')}")
    md.append(f"- Section count: {result.get('section_count')}")
    md.append(f"- Link count: {result.get('link_count')}")
    md.append("")
    if result.get("issues"):
        md.append("## Issues")
        for i in result["issues"]:
            md.append(f"- {i}")
        md.append("")
    full = result.get("full_version") or {}
    md.append(f"## llms-full.txt: {'Present' if full.get('exists') else 'Absent'}")
    (out_dir / "llmstxt.md").write_text("\n".join(md))
    return result.get("exists", False)


# ---------- Main driver ----------

SCHEMA_TARGETS = [
    ("home", ""),
    ("camps", "/programs/ekuzo-camps"),
    ("ekuzo100", "/programs/ekuzo100"),
    ("teams", "/programs/ekuzo-teams"),
]

CITABILITY_TARGETS = [
    ("home", ""),
    ("methodology", "/methodology"),
    ("parents", "/parents"),
    ("schools", "/schools"),
    ("camps", "/programs/ekuzo-camps"),
    ("ekuzo100", "/programs/ekuzo100"),
    ("teams", "/programs/ekuzo-teams"),
]


def main():
    base = sys.argv[1] if len(sys.argv) > 1 else "https://ekuzo.gg"
    base = base.rstrip("/")
    date = datetime.date.today().isoformat()
    out_dir = pathlib.Path("reports") / date
    out_dir.mkdir(parents=True, exist_ok=True)

    schema_scores = {}
    citability_scores = {}
    errors = []

    # Schema
    for label, path in SCHEMA_TARGETS:
        url = base + path
        try:
            page = fetch_page(url)
            schema = score_schema(page)
            write_schema_report(out_dir, label, url, page, schema)
            schema_scores[label] = schema["score"]
            print(f"[schema] {label}: {schema['score']}/100")
        except Exception as e:
            errors.append(f"schema {label} ({url}): {e}")
            schema_scores[label] = None
            print(f"[schema] {label}: ERROR {e}", file=sys.stderr)

    # Citability
    for label, path in CITABILITY_TARGETS:
        url = base + path
        try:
            cit = score_citability(url)
            write_citability_report(out_dir, label, url, cit)
            citability_scores[label] = cit.get("average_citability_score", 0)
            print(f"[citability] {label}: {citability_scores[label]}/100")
        except Exception as e:
            errors.append(f"citability {label} ({url}): {e}")
            citability_scores[label] = None
            print(f"[citability] {label}: ERROR {e}", file=sys.stderr)

    # Crawlers
    try:
        robots_text, robots_status = fetch_robots(base)
        blocked_any = write_crawlers_report(out_dir, base, robots_text, robots_status)
    except Exception as e:
        errors.append(f"crawlers: {e}")
        blocked_any = None

    # llms.txt
    try:
        llms = check_llmstxt(base)
        llms_present = write_llmstxt_report(out_dir, base, llms)
    except Exception as e:
        errors.append(f"llmstxt: {e}")
        llms_present = None

    # Previous month comparison
    prev = None
    all_runs = sorted(
        [p for p in pathlib.Path("reports").glob("*/SUMMARY.md")],
        key=lambda p: p.parent.name,
    )
    for p in reversed(all_runs):
        if p.parent.name < date:
            prev = p.parent
            break

    # Summary
    pages = [
        ("Homepage", "home", "home"),
        ("/methodology", None, "methodology"),
        ("/parents", None, "parents"),
        ("/schools", None, "schools"),
        ("/programs/ekuzo-camps", "camps", "camps"),
        ("/programs/ekuzo100", "ekuzo100", "ekuzo100"),
        ("/programs/ekuzo-teams", "teams", "teams"),
    ]

    md = []
    md.append(f"# GEO Audit Summary — {date}")
    md.append(f"**Base URL:** {base}  ")
    md.append("")
    md.append("## Scores")
    md.append("")
    md.append("| URL / Page | Schema Score | Citability Score |")
    md.append("|---|---|---|")
    for pretty, schema_key, cit_key in pages:
        s = schema_scores.get(schema_key)
        c = citability_scores.get(cit_key)
        s_disp = f"{s}/100" if s is not None else "—"
        c_disp = f"{c}/100" if c is not None else "—"
        md.append(f"| {pretty} | {s_disp} | {c_disp} |")
    md.append("")
    md.append("## Infrastructure")
    md.append("")
    if blocked_any is None:
        md.append("- **AI crawlers:** _error — see crawlers.md_")
    elif blocked_any:
        md.append("- **AI crawlers:** ⚠️ One or more blocked — see crawlers.md")
    else:
        md.append("- **AI crawlers:** All major AI crawlers allowed")
    if llms_present is None:
        md.append("- **llms.txt:** _error — see llmstxt.md_")
    elif llms_present:
        md.append("- **llms.txt:** Present")
    else:
        md.append("- **llms.txt:** ABSENT (404) — consider generating one")
    md.append("")

    # Comparison
    if prev:
        md.append(f"## Comparison vs. {prev.name}")
        md.append("")
        try:
            import re
            prev_text = (prev / "SUMMARY.md").read_text()
            rows = re.findall(r"\| (.+?) \| ([0-9—\.]+)(?:/100)? \| ([0-9—\.]+)(?:/100)? \|", prev_text)
            prev_map = {r[0]: (r[1], r[2]) for r in rows}
            md.append("| Page | Schema Δ | Citability Δ |")
            md.append("|---|---|---|")
            for pretty, schema_key, cit_key in pages:
                prev_s, prev_c = prev_map.get(pretty, ("—", "—"))
                cur_s = schema_scores.get(schema_key)
                cur_c = citability_scores.get(cit_key)

                def delta(prev_v, cur_v):
                    try:
                        p = float(prev_v)
                        c = float(cur_v)
                        d = c - p
                        flag = " ⚠️" if d < 0 else ""
                        return f"{p:g} → {c:g} ({d:+g}){flag}"
                    except Exception:
                        return "—"

                s_d = delta(prev_s, cur_s) if cur_s is not None else "—"
                c_d = delta(prev_c, cur_c) if cur_c is not None else "—"
                md.append(f"| {pretty} | {s_d} | {c_d} |")
            md.append("")
        except Exception as e:
            md.append(f"_Comparison failed: {e}_")
            md.append("")
    else:
        md.append("## Comparison")
        md.append("")
        md.append("_No previous audit found. This run is the baseline._")
        md.append("")

    # Top improvement opportunities
    md.append("## Top Improvement Opportunities")
    md.append("")
    opps = []
    if llms_present is False:
        opps.append("Generate a `/llms.txt` file so AI crawlers can discover site structure and key content.")
    lowest_cit = sorted(
        [(k, v) for k, v in citability_scores.items() if v is not None],
        key=lambda x: x[1],
    )[:2]
    for k, v in lowest_cit:
        opps.append(f"Raise citability on **{k}** ({v}/100): add answer-block intros, tighten passages to 134–167 words, and increase statistical density. See citability-{k}.md for the lowest-scoring blocks.")
    lowest_schema = sorted(
        [(k, v) for k, v in schema_scores.items() if v is not None],
        key=lambda x: x[1],
    )[:1]
    for k, v in lowest_schema:
        opps.append(f"Strengthen schema on **{k}** ({v}/100). See schema-{k}.md for the missing criteria.")
    for i, opp in enumerate(opps[:5], 1):
        md.append(f"{i}. {opp}")
    md.append("")

    if errors:
        md.append("## Errors")
        md.append("")
        for e in errors:
            md.append(f"- {e}")
        md.append("")

    (out_dir / "SUMMARY.md").write_text("\n".join(md))
    print("\n" + "\n".join(md))


if __name__ == "__main__":
    main()
