#!/usr/bin/env python3
"""
build-klaviyo.py — Export a clean Klaviyo-ready file from a source template.

History:
  Apr 2026: produced two variant files (BUILDING + LOOKING) by stripping
  variant <tr>/<div> blocks from a single source.

  May 22 2026: variant split retired — everyone starts solo. Build now
  produces a single <name>.klaviyo.html file per source. Variant-stripping
  helpers (strip_variant_blocks / unwrap_variant_blocks) removed; if
  variants ever come back, restore from git.

What it does now:
  1. Reads a source HTML template (e.g. 01-purchase-confirmation.html).
  2. Strips everything between <!-- PREVIEW-ONLY:START --> and
     <!-- PREVIEW-ONLY:END --> (the preview-only banner + its CSS).
  3. Rewrites bare {{ token }}s to Klaviyo's event.extra / person namespaces.
  4. Swaps placeholder unsubscribe anchors for Klaviyo compliance tags.
  5. Writes klaviyo-ready/<name>.klaviyo.html.

Usage:
    python3 build-klaviyo.py                          # builds every numbered template in this dir
    python3 build-klaviyo.py 01-purchase-confirmation.html   # builds one
"""

import re
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
OUTPUT_DIR = SCRIPT_DIR / "klaviyo-ready"


# Maps the "friendly" bare tokens we write in source HTML to the full Klaviyo
# template syntax required in an event-triggered flow.
#
# Context: flows are triggered by the `Placed Order` metric event from Jamie's
# webhook. Event properties use `{{ event.extra.* }}`; profile properties use
# `{{ person.* }}`. `squad_link` is written into event extras by the Stripe
# webhook (EKUZO-Web app/api/webhooks/stripe/route.ts) — points to the
# tokenized register URL the buyer shares with friends.
TOKEN_MAP = {
    "{{ first_name }}": "{{ person.first_name }}",
    "{{ gamer_name }}": "{{ event.extra.gamer_name }}",
    '{{ gamer_name|slice:":1"|upper }}': '{{ event.extra.gamer_name|slice:":1"|upper }}',
    "{{ camp_week_dates }}": "{{ event.extra.camp_week_dates }}",
    # cohort_label (e100): complete human-readable schedule string built
    # by the register-page picker (e.g. "Tuesdays & Thursdays · Jun 2 –
    # Jun 25, 2026"). The Stripe webhook forwards it as event extra
    # for any Placed Order metric where product==="ekuzo100". This is
    # the e100 counterpart to camps' camp_week_dates — same role
    # (schedule string in the confirmation email), different shape
    # (month-anchored cohort vs single-week unit).
    "{{ cohort_label }}": "{{ event.extra.cohort_label }}",
    # semester_label (teams): single-value cohort string built by the
    # teams register-page semester picker (e.g. "Fall 2026"). The
    # teams counterpart to camps' camp_week_dates and e100's
    # cohort_label — same role (cohort string in the confirmation
    # email's order summary), different shape (single semester
    # vs. week/cohort).
    "{{ semester_label }}": "{{ event.extra.team_semester }}",
    # team_payment_plan (teams): "upfront" or "installment", set by
    # the teams register-page payment-plan toggle and forwarded as
    # the Klaviyo event extra `team_payment_plan` by the Stripe
    # webhook for Placed Order events where product==="teams".
    "{{ team_payment_plan }}": "{{ event.extra.team_payment_plan }}",
    "{{ value }}": "{{ event.extra.value }}",
    "{{ order_id }}": "{{ event.extra.order_id }}",
    "{{ squad_link }}": "{{ event.extra.squad_link }}",
}


def rewrite_klaviyo_tokens(html: str) -> str:
    """Swap bare preview tokens for Klaviyo's event.extra/person namespaces."""
    # Replace longer keys first so that `gamer_name|slice:...` is matched before `gamer_name`.
    for bare in sorted(TOKEN_MAP, key=len, reverse=True):
        html = html.replace(bare, TOKEN_MAP[bare])
    return html


# Footer unsubscribe + email-preferences anchors use href="#" placeholders in
# source so browser preview renders without dead JS. Klaviyo requires functional
# template tags instead — they generate per-recipient signed URLs at send time.
# Compliance: CAN-SPAM requires a working unsubscribe; Klaviyo won't save a
# template without one.
KLAVIYO_TAG_REPLACEMENTS = [
    (
        '<a href="#" style="color: #FFFFFF; text-decoration: underline;">Unsubscribe</a>',
        "{% unsubscribe 'Unsubscribe' %}",
    ),
    (
        '<a href="#" style="color: #FFFFFF; text-decoration: underline;">Email Preferences</a>',
        "{% manage_preferences 'Email Preferences' %}",
    ),
    # Pre-May-22 stylings kept for backward compat with older source files.
    (
        '<a href="#" style="color: #666666; text-decoration: underline;">Unsubscribe</a>',
        "{% unsubscribe 'Unsubscribe' %}",
    ),
    (
        '<a href="#" style="color: #666666; text-decoration: underline;">Email Preferences</a>',
        "{% manage_preferences 'Email Preferences' %}",
    ),
]


def rewrite_klaviyo_tags(html: str) -> str:
    """Swap placeholder anchors for Klaviyo compliance template tags."""
    for old, new in KLAVIYO_TAG_REPLACEMENTS:
        html = html.replace(old, new)
    return html


# Inside `sms:` and `mailto:` hrefs, the squad-link URL ends up as the value
# of a `body=` parameter. Klaviyo renders `{{ event.extra.squad_link }}` to
# a real URL that contains its OWN query string (`...register?squad=TOKEN`).
# Strict URI parsers (per RFC 6068 mailto / RFC 5724 sms) treat that `?` as
# starting a new query component and can truncate the body. The visible
# `<a href="{{ ... }}">` preview block keeps the link plain (we want a
# clickable, decoded URL there); only the body= context gets `|urlencode`d.
SMS_MAILTO_URLENCODE_RE = re.compile(
    r'(href="(?:sms:|mailto:)[^"]*body=[^"]*?)\{\{\s*event\.extra\.squad_link\s*\}\}'
)


def rewrite_sms_mailto_urlencode(html: str) -> str:
    """URL-encode the squad link wherever it lives inside an sms/mailto body."""
    return SMS_MAILTO_URLENCODE_RE.sub(
        r"\1{{ event.extra.squad_link|urlencode }}", html
    )


def strip_preview_blocks(html: str) -> str:
    """Remove every region between PREVIEW-ONLY:START and PREVIEW-ONLY:END.

    Handles both HTML comments (<!-- ... -->) and CSS comments (/* ... */).
    """
    pattern = re.compile(
        r"(<!--\s*PREVIEW-ONLY:START.*?PREVIEW-ONLY:END\s*-->)"
        r"|(/\*\s*PREVIEW-ONLY:START.*?PREVIEW-ONLY:END\s*\*/)",
        re.DOTALL,
    )
    return pattern.sub("", html)


def build(source_html: str) -> str:
    html = strip_preview_blocks(source_html)
    html = rewrite_klaviyo_tokens(html)
    html = rewrite_sms_mailto_urlencode(html)
    html = rewrite_klaviyo_tags(html)
    return html


def build_file(source_path: Path) -> None:
    if not source_path.exists():
        print(f"  ! skip (not found): {source_path}")
        return
    source = source_path.read_text(encoding="utf-8")
    stem = source_path.stem  # e.g. "01-purchase-confirmation"

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    out = build(source)
    out_path = OUTPUT_DIR / f"{stem}.klaviyo.html"
    out_path.write_text(out, encoding="utf-8")
    print(f"  ✓ wrote {out_path.relative_to(SCRIPT_DIR.parent)}")


def main(argv):
    targets = []
    if len(argv) > 1:
        targets = [SCRIPT_DIR / name for name in argv[1:]]
    else:
        # Default: every numbered template in this directory.
        targets = sorted(
            p for p in SCRIPT_DIR.glob("*.html")
            if p.name[:2].isdigit() and "klaviyo" not in p.name.lower()
        )
    if not targets:
        print("No source templates found.")
        return 1
    print(f"Building Klaviyo output → {OUTPUT_DIR.relative_to(SCRIPT_DIR.parent)}/")
    for t in targets:
        print(f"- {t.name}")
        build_file(t)
    print("Done.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
