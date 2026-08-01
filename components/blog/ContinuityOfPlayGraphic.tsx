"use client";

/**
 * ── "The continuity of play" — the friend-map graphic on the military piece ──
 * Inlined 2026-07-31, replacing <Image src="/images/gaming-military-families-friend-map.png">.
 *
 * WHY INLINE. The source graphic is 2000x700 with 11px tracked labels. Scaled
 * into a phone-width column those labels land at roughly 4px and stop being
 * readable, which is the device most readers meet this piece on. The PNG stays
 * in public/images/ as the shareable/social asset; the page renders this.
 *
 * THREE RENDERS, ONE GRAPHIC:
 *   desktop in-flow (md and up) — the approved 2000x700 artwork, unchanged
 *     geometry, with the two embedded font faces dropped. It draws with the
 *     site's own Tungsten and Inter via var(--font-display) / var(--font-body),
 *     which is why this file is ~10KB and not the 298KB the standalone SVG
 *     weighs. In the article's prose column this lands around 1000px wide, so
 *     the 11px labels render near 5.5px. Legible enough to follow, not enough
 *     to read comfortably, hence:
 *   desktop expanded (added 2026-08-01, Jamie's ask) — click the graphic and it
 *     opens over the page at its NATIVE width. The overlay never renders the
 *     artwork below 1500px, so the labels land between 8px and their designed
 *     11px depending on the viewport, and it scrolls horizontally on narrow
 *     laptops rather than shrinking below legibility. Escape, backdrop click,
 *     or the close button dismisses; body scroll is locked while open.
 *   mobile (below md) — the same three panels stacked, with every piece of TYPE
 *     moved out of the SVG and into HTML. That is deliberate: HTML text wraps
 *     when a font resolves wider than expected, where SVG text would just
 *     overflow the viewBox. The SVGs there carry the node diagram only. No
 *     expand affordance on mobile; the stacked version is already legible.
 *
 * The artwork markup lives in GRAPHIC_BODY exactly once and is rendered by both
 * desktop states, so there is no duplicated <text> in the DOM for a crawler to
 * read twice. The overlay only mounts while open.
 *
 * The four red teammate shapes sit at identical offsets in all three panels on
 * purpose. That repetition IS the argument the graphic makes. Do not "improve"
 * it by varying them.
 *
 * Source SVG (with fonts embedded, for regenerating the PNG):
 * knowledge-base/outputs/ekuzo-continuity-of-play.svg
 */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const ALT =
  "Across a military move, a child's in-person friend group dissolves and restarts from one new friend, while the same four online teammates stay in exactly the same place.";

const GRAPHIC_BODY = (
  <>
    <title>The continuity of play</title>
    <desc>{ALT}</desc>
    <rect width="2000" height="700" fill="#f0edea"/>
    <text x="88" y="94" fontFamily="var(--font-display)" fontWeight="700" fontSize="66" letterSpacing=".02em" fill="#000000">THE <tspan fill="#F92524">CONTINUITY</tspan> OF PLAY</text>
    <text x="1912" y="68" textAnchor="end" fontFamily="var(--font-body)" fontWeight="600" fontSize="12" letterSpacing=".15em" fill="#6d655e">ON AVERAGE, MILITARY KIDS CHANGE SCHOOLS</text>
    <text x="1912" y="106" textAnchor="end" fontFamily="var(--font-body)" fontWeight="600" fontSize="12" letterSpacing=".15em" fill="#6d655e"><tspan fontFamily="var(--font-display)" fontWeight="900" fontSize="42" letterSpacing=".02em" fill="#F92524">6&#8211;9</tspan> TIMES BEFORE GRADUATION, ABOUT <tspan fontFamily="var(--font-display)" fontWeight="900" fontSize="42" letterSpacing=".02em" fill="#000000">3</tspan><tspan fontFamily="var(--font-body)" fontWeight="700" fontSize="27" letterSpacing="0" fill="#000000">&#215;</tspan> THE CIVILIAN RATE</text>
    <line x1="88" y1="126" x2="1912" y2="126" stroke="#000000" strokeWidth="2"/>
    <line x1="696" y1="176" x2="696" y2="596" stroke="#d5cdc4"/>
    <line x1="1304" y1="176" x2="1304" y2="596" stroke="#d5cdc4"/>
    <g stroke="#A435F0" strokeWidth="2" strokeLinecap="round"><line x1="392" y1="330" x2="292" y2="374"/><line x1="392" y1="330" x2="336" y2="410"/><line x1="392" y1="330" x2="392" y2="426"/><line x1="392" y1="330" x2="448" y2="410"/><line x1="392" y1="330" x2="492" y2="374"/></g>
    <circle cx="292" cy="374" r="9" fill="#f0edea" stroke="#A435F0" strokeWidth="2" opacity="1"/>
    <circle cx="336" cy="410" r="9" fill="#f0edea" stroke="#A435F0" strokeWidth="2" opacity="1"/>
    <circle cx="392" cy="426" r="9" fill="#f0edea" stroke="#A435F0" strokeWidth="2" opacity="1"/>
    <circle cx="448" cy="410" r="9" fill="#f0edea" stroke="#A435F0" strokeWidth="2" opacity="1"/>
    <circle cx="492" cy="374" r="9" fill="#f0edea" stroke="#A435F0" strokeWidth="2" opacity="1"/>
    <line x1="1000" y1="330" x2="962" y2="347" stroke="#A435F0" strokeWidth="2" strokeLinecap="round" opacity="0.55"/><line x1="962" y1="347" x2="932" y2="360" stroke="#A435F0" strokeWidth="2" strokeLinecap="round" opacity="0.3"/><line x1="932" y1="360" x2="906" y2="371" stroke="#A435F0" strokeWidth="2" strokeLinecap="round" opacity="0.12"/>
    <line x1="1000" y1="330" x2="979" y2="360" stroke="#A435F0" strokeWidth="2" strokeLinecap="round" opacity="0.55"/><line x1="979" y1="360" x2="962" y2="384" stroke="#A435F0" strokeWidth="2" strokeLinecap="round" opacity="0.3"/><line x1="962" y1="384" x2="947" y2="405" stroke="#A435F0" strokeWidth="2" strokeLinecap="round" opacity="0.12"/>
    <line x1="1000" y1="330" x2="1000" y2="366" stroke="#A435F0" strokeWidth="2" strokeLinecap="round" opacity="0.55"/><line x1="1000" y1="366" x2="1000" y2="395" stroke="#A435F0" strokeWidth="2" strokeLinecap="round" opacity="0.3"/><line x1="1000" y1="395" x2="1000" y2="420" stroke="#A435F0" strokeWidth="2" strokeLinecap="round" opacity="0.12"/>
    <line x1="1000" y1="330" x2="1021" y2="360" stroke="#A435F0" strokeWidth="2" strokeLinecap="round" opacity="0.55"/><line x1="1021" y1="360" x2="1038" y2="384" stroke="#A435F0" strokeWidth="2" strokeLinecap="round" opacity="0.3"/><line x1="1038" y1="384" x2="1053" y2="405" stroke="#A435F0" strokeWidth="2" strokeLinecap="round" opacity="0.12"/>
    <line x1="1000" y1="330" x2="1038" y2="347" stroke="#A435F0" strokeWidth="2" strokeLinecap="round" opacity="0.55"/><line x1="1038" y1="347" x2="1068" y2="360" stroke="#A435F0" strokeWidth="2" strokeLinecap="round" opacity="0.3"/><line x1="1068" y1="360" x2="1094" y2="371" stroke="#A435F0" strokeWidth="2" strokeLinecap="round" opacity="0.12"/>
    <circle cx="900" cy="374" r="9" fill="#f0edea" stroke="#A435F0" strokeWidth="2" strokeDasharray="4 6" opacity="0.4"/>
    <circle cx="944" cy="410" r="9" fill="#f0edea" stroke="#A435F0" strokeWidth="2" strokeDasharray="4 6" opacity="0.4"/>
    <circle cx="1000" cy="426" r="9" fill="#f0edea" stroke="#A435F0" strokeWidth="2" strokeDasharray="4 6" opacity="0.4"/>
    <circle cx="1056" cy="410" r="9" fill="#f0edea" stroke="#A435F0" strokeWidth="2" strokeDasharray="4 6" opacity="0.4"/>
    <circle cx="1100" cy="374" r="9" fill="#f0edea" stroke="#A435F0" strokeWidth="2" strokeDasharray="4 6" opacity="0.4"/>
    <line x1="1608" y1="330" x2="1608" y2="426" stroke="#A435F0" strokeWidth="2" strokeDasharray="5 7" strokeLinecap="round"/>
    <circle cx="1608" cy="426" r="9" fill="#f0edea" stroke="#A435F0" strokeWidth="2" opacity="1"/>
    <line x1="88" y1="330" x2="1912" y2="330" stroke="#000000" strokeWidth="1.5"/>
    <text x="88" y="316" textAnchor="start" fontFamily="var(--font-body)" fontWeight="600" fontSize="11" letterSpacing=".15em" fill="#F92524">ONLINE</text>
    <text x="88" y="356" textAnchor="start" fontFamily="var(--font-body)" fontWeight="600" fontSize="11" letterSpacing=".15em" fill="#A435F0">IN PERSON</text>
    <g stroke="#F92524" strokeWidth="2.5" strokeLinecap="round"><line x1="392" y1="330" x2="292" y2="284"/><line x1="392" y1="330" x2="356" y2="246"/><line x1="392" y1="330" x2="428" y2="246"/><line x1="392" y1="330" x2="492" y2="284"/></g>
    <circle cx="292" cy="284" r="10.5" fill="#F92524"/><polygon points="356,233.5 367.5,246 356,258.5 344.5,246" fill="#F92524" strokeLinejoin="round"/><polygon points="428,234.5 438.5,253 417.5,253" fill="#F92524" strokeLinejoin="round"/><polygon points="492.0,272.5 502.9,280.4 498.8,293.3 485.2,293.3 481.1,280.4" fill="#F92524" strokeLinejoin="round"/>
    <circle cx="392" cy="330" r="14" fill="#000000"/>
    <g stroke="#F92524" strokeWidth="2.5" strokeLinecap="round"><line x1="1000" y1="330" x2="900" y2="284"/><line x1="1000" y1="330" x2="964" y2="246"/><line x1="1000" y1="330" x2="1036" y2="246"/><line x1="1000" y1="330" x2="1100" y2="284"/></g>
    <circle cx="900" cy="284" r="10.5" fill="#F92524"/><polygon points="964,233.5 975.5,246 964,258.5 952.5,246" fill="#F92524" strokeLinejoin="round"/><polygon points="1036,234.5 1046.5,253 1025.5,253" fill="#F92524" strokeLinejoin="round"/><polygon points="1100.0,272.5 1110.9,280.4 1106.8,293.3 1093.2,293.3 1089.1,280.4" fill="#F92524" strokeLinejoin="round"/>
    <circle cx="1000" cy="330" r="14" fill="#000000"/>
    <g stroke="#F92524" strokeWidth="2.5" strokeLinecap="round"><line x1="1608" y1="330" x2="1508" y2="284"/><line x1="1608" y1="330" x2="1572" y2="246"/><line x1="1608" y1="330" x2="1644" y2="246"/><line x1="1608" y1="330" x2="1708" y2="284"/></g>
    <circle cx="1508" cy="284" r="10.5" fill="#F92524"/><polygon points="1572,233.5 1583.5,246 1572,258.5 1560.5,246" fill="#F92524" strokeLinejoin="round"/><polygon points="1644,234.5 1654.5,253 1633.5,253" fill="#F92524" strokeLinejoin="round"/><polygon points="1708.0,272.5 1718.9,280.4 1714.8,293.3 1701.2,293.3 1697.1,280.4" fill="#F92524" strokeLinejoin="round"/>
    <circle cx="1608" cy="330" r="14" fill="#000000"/>
    <text x="392" y="196" textAnchor="middle" fontFamily="var(--font-body)" fontWeight="600" fontSize="11" letterSpacing=".15em" fill="#F92524">THE ONLINE TEAM</text>
    <text x="1000" y="196" textAnchor="middle" fontFamily="var(--font-body)" fontWeight="600" fontSize="11" letterSpacing=".15em" fill="#F92524">UNCHANGED</text>
    <text x="1608" y="196" textAnchor="middle" fontFamily="var(--font-body)" fontWeight="600" fontSize="11" letterSpacing=".15em" fill="#F92524">STILL UNCHANGED</text>
    <text x="392" y="466" textAnchor="middle" fontFamily="var(--font-body)" fontWeight="600" fontSize="11" letterSpacing=".15em" fill="#A435F0">THE LOCAL FRIEND MAP</text>
    <text x="1000" y="466" textAnchor="middle" fontFamily="var(--font-body)" fontWeight="600" fontSize="11" letterSpacing=".15em" fill="#A435F0">EVERY MOVE ENDS THEM</text>
    <text x="1608" y="466" textAnchor="middle" fontFamily="var(--font-body)" fontWeight="600" fontSize="11" letterSpacing=".15em" fill="#A435F0">A NEW LOCAL MAP BEGINS</text>
    <text x="392" y="556" textAnchor="middle" fontFamily="var(--font-display)" fontWeight="600" fontSize="54" letterSpacing=".02em" fill="#000000">TWO GROUPS, ONE KID</text>
    <text x="1000" y="556" textAnchor="middle" fontFamily="var(--font-display)" fontWeight="600" fontSize="54" letterSpacing=".02em" fill="#000000">ONLY ONE GROUP TRAVELS</text>
    <text x="1608" y="556" textAnchor="middle" fontFamily="var(--font-display)" fontWeight="600" fontSize="54" letterSpacing=".02em" fill="#000000">SUPPORT IS ALREADY THERE</text>
    <line x1="88" y1="622" x2="1912" y2="622" stroke="#d5cdc4"/>
    <text x="88" y="650" fontFamily="var(--font-body)" fontSize="12.5" fill="#6d655e">Sources: National Academies of Sciences, Engineering, and Medicine, 2019. EKUZO parent interview, July 2026.</text>
    <text x="1912" y="652" textAnchor="end" fontFamily="var(--font-display)" fontWeight="700" fontSize="26" letterSpacing=".08em" fill="#000000">EKUZO.GG</text>
  </>
);

export default function ContinuityOfPlayGraphic() {
  const [expanded, setExpanded] = useState(false);

  // Escape to close, and lock the page behind the overlay so a trackpad flick
  // doesn't scroll the article underneath it.
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [expanded]);

  return (
    <>
      <figure className="my-10">
        {/* ── Desktop, in flow. One button wraps the artwork and its label,
             so there is a single tab stop and the control sits BELOW the
             graphic rather than on top of it. An overlaid pill covered the
             EKUZO.GG mark in the bottom-right corner. ──────────────────── */}
        <div className="hidden md:block">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            aria-label="Expand the continuity of play graphic to full size"
            className="group block w-full cursor-zoom-in text-left"
          >
            <span className="block bg-[#f0edea]">
              <svg
                viewBox="0 0 2000 700"
                className="h-auto w-full"
                role="img"
                aria-label={ALT}
              >
                {GRAPHIC_BODY}
              </svg>
            </span>
            <span className="mt-2 flex items-center gap-1.5 font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-black/50 transition-colors group-hover:text-red">
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M9 3H3v6M15 3h6v6M9 21H3v-6M15 21h6v-6" />
              </svg>
              Expand for full size
            </span>
          </button>
        </div>

      <div className="md:hidden px-5 py-7" aria-hidden="true">
        <p
          className="font-display text-black leading-none uppercase"
          style={{ fontSize: "clamp(1.75rem, 9vw, 2.5rem)" }}
        >
          The <span className="text-red">continuity</span> of play
        </p>
        <p className="font-body text-[9.5px] font-semibold uppercase tracking-[0.15em] text-[#6d655e] mt-3">
          Military kids change schools
        </p>
        <p className="font-body text-[10px] font-semibold uppercase tracking-[0.13em] text-[#6d655e] mt-1 flex flex-wrap items-baseline gap-x-1.5">
          <span className="font-display text-red text-[2rem] leading-none normal-case tracking-normal">6&#8211;9</span>
          times before graduation, about
          <span className="font-display text-black text-[2rem] leading-none normal-case tracking-normal">3&#215;</span>
          the civilian rate
        </p>
        <div className="h-0.5 bg-black mt-4 mb-7" />

        <div>
          <p className="font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-red text-center">THE ONLINE TEAM</p>
          <svg viewBox="0 0 240 212" className="w-full h-auto my-2" aria-hidden="true" focusable="false">
          <g stroke="#A435F0" strokeWidth="2" strokeLinecap="round"><line x1="120" y1="100" x2="20" y2="144" /><line x1="120" y1="100" x2="64" y2="180" /><line x1="120" y1="100" x2="120" y2="196" /><line x1="120" y1="100" x2="176" y2="180" /><line x1="120" y1="100" x2="220" y2="144" /></g>
          <circle cx="20" cy="144" r="9" fill="#f0edea" stroke="#A435F0" strokeWidth="2" />
          <circle cx="64" cy="180" r="9" fill="#f0edea" stroke="#A435F0" strokeWidth="2" />
          <circle cx="120" cy="196" r="9" fill="#f0edea" stroke="#A435F0" strokeWidth="2" />
          <circle cx="176" cy="180" r="9" fill="#f0edea" stroke="#A435F0" strokeWidth="2" />
          <circle cx="220" cy="144" r="9" fill="#f0edea" stroke="#A435F0" strokeWidth="2" />
          <line x1="0" y1="100" x2="240" y2="100" stroke="#000000" strokeWidth="1.5" />
          <g stroke="#F92524" strokeWidth="2.5" strokeLinecap="round"><line x1="120" y1="100" x2="20" y2="54" /><line x1="120" y1="100" x2="84" y2="16" /><line x1="120" y1="100" x2="156" y2="16" /><line x1="120" y1="100" x2="220" y2="54" /></g>
          <circle cx="20" cy="54" r="10.5" fill="#F92524" />
          <polygon points="84,3.5 95.5,16 84,28.5 72.5,16" fill="#F92524" strokeLinejoin="round" />
          <polygon points="156,4.5 166.5,23 145.5,23" fill="#F92524" strokeLinejoin="round" />
          <polygon points="220,42.5 230.9,50.4 226.8,63.3 213.2,63.3 209.1,50.4" fill="#F92524" strokeLinejoin="round" />
          <circle cx="120" cy="100" r="14" fill="#000000" />
          </svg>
          <p className="font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-[#A435F0] text-center">THE LOCAL FRIEND MAP</p>
          <p
            className="font-display text-black text-center leading-[0.95] mt-3 uppercase"
            style={{ fontSize: "clamp(1.625rem, 8.5vw, 2.375rem)" }}
          >
            Two groups, one kid
          </p>
        </div>

        <div className="h-px bg-[#d5cdc4] my-7" />
        <div>
          <p className="font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-red text-center">UNCHANGED</p>
          <svg viewBox="0 0 240 212" className="w-full h-auto my-2" aria-hidden="true" focusable="false">
          <line x1="120" y1="100" x2="82" y2="117" stroke="#A435F0" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
          <line x1="82" y1="117" x2="50" y2="131" stroke="#A435F0" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
          <line x1="50" y1="131" x2="20" y2="144" stroke="#A435F0" strokeWidth="2" strokeLinecap="round" opacity="0.12" />
          <line x1="120" y1="100" x2="99" y2="130" stroke="#A435F0" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
          <line x1="99" y1="130" x2="81" y2="156" stroke="#A435F0" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
          <line x1="81" y1="156" x2="64" y2="180" stroke="#A435F0" strokeWidth="2" strokeLinecap="round" opacity="0.12" />
          <line x1="120" y1="100" x2="120" y2="136" stroke="#A435F0" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
          <line x1="120" y1="136" x2="120" y2="167" stroke="#A435F0" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
          <line x1="120" y1="167" x2="120" y2="196" stroke="#A435F0" strokeWidth="2" strokeLinecap="round" opacity="0.12" />
          <line x1="120" y1="100" x2="141" y2="130" stroke="#A435F0" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
          <line x1="141" y1="130" x2="159" y2="156" stroke="#A435F0" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
          <line x1="159" y1="156" x2="176" y2="180" stroke="#A435F0" strokeWidth="2" strokeLinecap="round" opacity="0.12" />
          <line x1="120" y1="100" x2="158" y2="117" stroke="#A435F0" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
          <line x1="158" y1="117" x2="190" y2="131" stroke="#A435F0" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
          <line x1="190" y1="131" x2="220" y2="144" stroke="#A435F0" strokeWidth="2" strokeLinecap="round" opacity="0.12" />
          <circle cx="20" cy="144" r="9" fill="#f0edea" stroke="#A435F0" strokeWidth="2" strokeDasharray="4 6" opacity="0.4" />
          <circle cx="64" cy="180" r="9" fill="#f0edea" stroke="#A435F0" strokeWidth="2" strokeDasharray="4 6" opacity="0.4" />
          <circle cx="120" cy="196" r="9" fill="#f0edea" stroke="#A435F0" strokeWidth="2" strokeDasharray="4 6" opacity="0.4" />
          <circle cx="176" cy="180" r="9" fill="#f0edea" stroke="#A435F0" strokeWidth="2" strokeDasharray="4 6" opacity="0.4" />
          <circle cx="220" cy="144" r="9" fill="#f0edea" stroke="#A435F0" strokeWidth="2" strokeDasharray="4 6" opacity="0.4" />
          <line x1="0" y1="100" x2="240" y2="100" stroke="#000000" strokeWidth="1.5" />
          <g stroke="#F92524" strokeWidth="2.5" strokeLinecap="round"><line x1="120" y1="100" x2="20" y2="54" /><line x1="120" y1="100" x2="84" y2="16" /><line x1="120" y1="100" x2="156" y2="16" /><line x1="120" y1="100" x2="220" y2="54" /></g>
          <circle cx="20" cy="54" r="10.5" fill="#F92524" />
          <polygon points="84,3.5 95.5,16 84,28.5 72.5,16" fill="#F92524" strokeLinejoin="round" />
          <polygon points="156,4.5 166.5,23 145.5,23" fill="#F92524" strokeLinejoin="round" />
          <polygon points="220,42.5 230.9,50.4 226.8,63.3 213.2,63.3 209.1,50.4" fill="#F92524" strokeLinejoin="round" />
          <circle cx="120" cy="100" r="14" fill="#000000" />
          </svg>
          <p className="font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-[#A435F0] text-center">EVERY MOVE ENDS THEM</p>
          <p
            className="font-display text-black text-center leading-[0.95] mt-3 uppercase"
            style={{ fontSize: "clamp(1.625rem, 8.5vw, 2.375rem)" }}
          >
            Only one group travels
          </p>
        </div>

        <div className="h-px bg-[#d5cdc4] my-7" />
        <div>
          <p className="font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-red text-center">STILL UNCHANGED</p>
          <svg viewBox="0 0 240 212" className="w-full h-auto my-2" aria-hidden="true" focusable="false">
          <line x1="120" y1="100" x2="120" y2="196" stroke="#A435F0" strokeWidth="2" strokeDasharray="5 7" strokeLinecap="round" />
          <circle cx="120" cy="196" r="9" fill="#f0edea" stroke="#A435F0" strokeWidth="2" />
          <line x1="0" y1="100" x2="240" y2="100" stroke="#000000" strokeWidth="1.5" />
          <g stroke="#F92524" strokeWidth="2.5" strokeLinecap="round"><line x1="120" y1="100" x2="20" y2="54" /><line x1="120" y1="100" x2="84" y2="16" /><line x1="120" y1="100" x2="156" y2="16" /><line x1="120" y1="100" x2="220" y2="54" /></g>
          <circle cx="20" cy="54" r="10.5" fill="#F92524" />
          <polygon points="84,3.5 95.5,16 84,28.5 72.5,16" fill="#F92524" strokeLinejoin="round" />
          <polygon points="156,4.5 166.5,23 145.5,23" fill="#F92524" strokeLinejoin="round" />
          <polygon points="220,42.5 230.9,50.4 226.8,63.3 213.2,63.3 209.1,50.4" fill="#F92524" strokeLinejoin="round" />
          <circle cx="120" cy="100" r="14" fill="#000000" />
          </svg>
          <p className="font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-[#A435F0] text-center">A NEW LOCAL MAP BEGINS</p>
          <p
            className="font-display text-black text-center leading-[0.95] mt-3 uppercase"
            style={{ fontSize: "clamp(1.625rem, 8.5vw, 2.375rem)" }}
          >
            Support is already there
          </p>
        </div>
        <div className="h-px bg-[#d5cdc4] mt-8 mb-4" />
        <div className="flex items-end justify-between gap-4">
          <p className="font-body text-[11px] leading-snug text-[#6d655e]">
            Sources: National Academies of Sciences, Engineering, and Medicine,
            2019. EKUZO parent interview, July 2026.
          </p>
          <p className="font-display text-black text-[1.375rem] leading-none tracking-[0.08em] shrink-0">
            EKUZO.GG
          </p>
        </div>
      </div>
      </figure>

      {/* ── Desktop, expanded. Mounts only while open, and PORTALS to
           document.body. It has to: this component renders deep inside
           <article className="relative overflow-hidden"> and a fixed overlay
           left in place there gets painted over by the article's own stacking
           context (verified on production 2026-08-01, where a strip of body
           copy sat on top of the backdrop).
           The artwork fits the viewport rather than forcing its native 2000px.
           An earlier version floored the width at 1500px to hold the labels at
           their designed 11px, but on a 1456px laptop that clipped the third
           panel off the right edge behind a scrollbar most people would never
           find. Fitting gives roughly 7.5px on a 13-inch screen and close to
           10px on a 1920px monitor, against 5.5px in the prose column, with
           nothing cut off. ────────────────────────────────────────────────── */}
      {expanded &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="The continuity of play, expanded"
            onClick={() => setExpanded(false)}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 lg:p-10"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[2000px] bg-[#f0edea]"
            >
              <svg
                viewBox="0 0 2000 700"
                className="h-auto w-full"
                role="img"
                aria-label={ALT}
              >
                {GRAPHIC_BODY}
              </svg>
            </div>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              aria-label="Close the expanded graphic"
              className="fixed right-5 top-5 flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur transition-colors hover:bg-white/25"
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M5 5l14 14M19 5L5 19" />
              </svg>
              Close
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
