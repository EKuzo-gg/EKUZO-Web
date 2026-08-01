/**
 * ── "One game, two jobs" — the midpoint graphic on the fortnite piece ────────
 * Added 2026-08-01. The piece runs long between "What the ban fixed, and what
 * it broke" and "What she actually did", and this sits at that seam.
 *
 * It draws the article's actual thesis: Fortnite was doing two jobs in her
 * house at once, and a ban ends both. The asymmetry is the point and must
 * survive any redesign. One ending is the win she aimed for (the red tie is
 * CUT, cleanly, and her son's node goes solid). The other is the cost she did
 * not see coming (the purple tie DISSOLVES in fading segments, and its node
 * goes dashed). Same dissolve language as the friend map on the sibling piece,
 * on purpose: the two graphics are a set.
 *
 * SHAPE GRAMMAR: a square is the game, circles are people and outcomes. That
 * exists because an earlier draft used a black circle for the game in one
 * panel and a black circle for her son in the other, which read as the same
 * thing twice.
 *
 * Canvas is 1200x560, not the friend map's 2000x700. Deliberate: at the ~1000px
 * the prose column gives it, a smaller canvas puts the 11px labels near 9px
 * instead of 5.5px, so this one needs no expand affordance.
 *
 * Desktop draws the SVG. Mobile keeps the SVG for the node diagram only and
 * moves every piece of type into HTML, so it wraps under a font fallback
 * instead of overflowing the viewBox. Same split as the friend map.
 */

const ALT =
  "Before the ban, one game does two jobs in the house: it hijacks one son's behavior and it gives two brothers somewhere to meet. After the ban, the first tie is cut and her son comes back, and the second dissolves along with it, taking the brothers' shared ground.";

export default function TwoJobsGraphic() {
  return (
    <figure className="my-10 bg-[#f0edea]">
      {/* ── Desktop ─────────────────────────────────────────────────────── */}
      <svg
        viewBox="0 0 1200 560"
        className="hidden md:block w-full h-auto"
        role="img"
        aria-label={ALT}
      >
        <title>One game, two jobs</title>
        <desc>{ALT}</desc>
    <rect width="1200" height="560" fill="#f0edea"/>
    <text x="60" y="76" fontFamily="var(--font-display)" fontWeight="700" fontSize="48" letterSpacing=".02em" fill="#000000">ONE GAME, <tspan fill="#F92524">TWO JOBS</tspan></text>
    <text x="1140" y="72" textAnchor="end" fontFamily="var(--font-body)" fontWeight="600" fontSize="11" letterSpacing=".15em" fill="#6d655e">WHAT ONE BAN ACTUALLY REMOVED</text>
    <line x1="60" y1="100" x2="1140" y2="100" stroke="#000000" strokeWidth="2"/>
    <line x1="600" y1="140" x2="600" y2="470" stroke="#d5cdc4"/>
    <text x="318" y="146" textAnchor="middle" fontFamily="var(--font-body)" fontWeight="600" fontSize="11" letterSpacing=".14em" fill="#6d655e">BEFORE THE BAN</text>
    <line x1="318" y1="225" x2="200" y2="318" stroke="#F92524" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="318" y1="225" x2="436" y2="318" stroke="#A435F0" strokeWidth="2.5" strokeLinecap="round"/>
    <rect x="301" y="191" width="34" height="34" rx="8" fill="#000000"/>
    <text x="318" y="178" textAnchor="middle" fontFamily="var(--font-body)" fontWeight="600" fontSize="11" letterSpacing=".14em" fill="#000000">THE GAME</text>
    <circle cx="200" cy="330" r="11" fill="#F92524"/>
    <circle cx="436" cy="330" r="10" fill="#f0edea" stroke="#A435F0" strokeWidth="2.5"/>
    <text x="200" y="368" textAnchor="middle" fontFamily="var(--font-body)" fontWeight="600" fontSize="11" letterSpacing=".14em" fill="#F92524">HIJACKED</text><text x="200" y="385" textAnchor="middle" fontFamily="var(--font-body)" fontWeight="600" fontSize="11" letterSpacing=".14em" fill="#F92524">ONE SON'S BEHAVIOR</text>
    <text x="436" y="368" textAnchor="middle" fontFamily="var(--font-body)" fontWeight="600" fontSize="11" letterSpacing=".14em" fill="#A435F0">GAVE TWO BROTHERS</text><text x="436" y="385" textAnchor="middle" fontFamily="var(--font-body)" fontWeight="600" fontSize="11" letterSpacing=".14em" fill="#A435F0">SOMEWHERE TO MEET</text>
    <text x="318" y="452" textAnchor="middle" fontFamily="var(--font-display)" fontWeight="600" fontSize="36" letterSpacing=".02em" fill="#000000">THE GAME DID TWO JOBS</text>
    <text x="882" y="146" textAnchor="middle" fontFamily="var(--font-body)" fontWeight="600" fontSize="11" letterSpacing=".14em" fill="#6d655e">AFTER THE BAN</text>
    <rect x="865" y="191" width="34" height="34" rx="8" fill="#f0edea" stroke="#6d655e" strokeWidth="2" strokeDasharray="4 6"/>
    <text x="882" y="178" textAnchor="middle" fontFamily="var(--font-body)" fontWeight="600" fontSize="11" letterSpacing=".14em" fill="#6d655e">REMOVED</text>
    <line x1="882" y1="225" x2="826" y2="271" stroke="#F92524" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="798" y1="298" x2="764" y2="318" stroke="#F92524" strokeWidth="2.5" strokeLinecap="round"/>
    <g stroke="#F92524" strokeWidth="2.5" strokeLinecap="round"><line x1="802" y1="273" x2="818" y2="289"/><line x1="818" y1="273" x2="802" y2="289"/></g>
    <line x1="882" y1="225" x2="924" y2="258" stroke="#A435F0" strokeWidth="2.5" strokeLinecap="round" opacity="0.55"/>
    <line x1="924" y1="258" x2="962" y2="288" stroke="#A435F0" strokeWidth="2.5" strokeLinecap="round" opacity="0.28"/>
    <line x1="962" y1="288" x2="1000" y2="318" stroke="#A435F0" strokeWidth="2.5" strokeLinecap="round" opacity="0.1"/>
    <circle cx="764" cy="330" r="11" fill="#000000"/>
    <circle cx="1000" cy="330" r="10" fill="#f0edea" stroke="#A435F0" strokeWidth="2.5" strokeDasharray="4 6" opacity="0.4"/>
    <text x="764" y="368" textAnchor="middle" fontFamily="var(--font-body)" fontWeight="600" fontSize="11" letterSpacing=".14em" fill="#000000">HER SON</text><text x="764" y="385" textAnchor="middle" fontFamily="var(--font-body)" fontWeight="600" fontSize="11" letterSpacing=".14em" fill="#000000">CAME BACK</text>
    <text x="1000" y="368" textAnchor="middle" fontFamily="var(--font-body)" fontWeight="600" fontSize="11" letterSpacing=".14em" fill="#A435F0">THE OVERLAP</text><text x="1000" y="385" textAnchor="middle" fontFamily="var(--font-body)" fontWeight="600" fontSize="11" letterSpacing=".14em" fill="#A435F0">WENT WITH IT</text>
    <text x="882" y="452" textAnchor="middle" fontFamily="var(--font-display)" fontWeight="600" fontSize="36" letterSpacing=".02em" fill="#000000">THE BAN ENDED BOTH</text>
    <line x1="60" y1="498" x2="1140" y2="498" stroke="#d5cdc4"/>
    <text x="60" y="524" fontFamily="var(--font-body)" fontSize="11.5" fill="#6d655e">Source: EKUZO parent interview, July 2026.</text>
    <text x="1140" y="526" textAnchor="end" fontFamily="var(--font-display)" fontWeight="700" fontSize="20" letterSpacing=".08em" fill="#000000">EKUZO.GG</text>
      </svg>

      {/* ── Mobile: same two panels stacked, type in HTML so it wraps ────── */}
      <div className="md:hidden px-5 py-7" aria-hidden="true">
        <p
          className="font-display text-black leading-none uppercase"
          style={{ fontSize: "clamp(1.625rem, 8.5vw, 2.25rem)" }}
        >
          One game, <span className="text-red">two jobs</span>
        </p>
        <p className="font-body text-[9.5px] font-semibold uppercase tracking-[0.15em] text-[#6d655e] mt-2">
          What one ban actually removed
        </p>
        <div className="h-0.5 bg-black mt-4 mb-7" />

        <div>
          <p className="font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-center text-[#6d655e]">Before the ban</p>
          <p className="font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-center text-black mt-4">The game</p>
          <svg viewBox="0 0 280 200" className="w-full h-auto my-1" aria-hidden="true" focusable="false">
            <line x1="140" y1="60" x2="62" y2="139" stroke="#F92524" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="140" y1="60" x2="218" y2="139" stroke="#A435F0" strokeWidth="2.5" strokeLinecap="round" />
            <rect x="122" y="24" width="36" height="36" rx="8" fill="#000000" />
            <circle cx="62" cy="150" r="11" fill="#F92524" />
            <circle cx="218" cy="150" r="10" fill="#f0edea" stroke="#A435F0" strokeWidth="2.5" />
          </svg>
          <div className="grid grid-cols-2 gap-3">
            <p className="font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-center text-red">Hijacked<br />one son's behavior</p>
            <p className="font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-center text-[#A435F0]">Gave two brothers<br />somewhere to meet</p>
          </div>
          <p className="font-display text-black text-center leading-[0.95] mt-4 uppercase" style={{ fontSize: "clamp(1.5rem, 7.5vw, 2rem)" }}>The game did two jobs</p>
        </div>

        <div className="h-px bg-[#d5cdc4] my-7" />
        <div>
          <p className="font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-center text-[#6d655e]">After the ban</p>
          <p className="font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-center text-[#6d655e] mt-4">Removed</p>
          <svg viewBox="0 0 280 200" className="w-full h-auto my-1" aria-hidden="true" focusable="false">
            <rect x="122" y="24" width="36" height="36" rx="8" fill="#f0edea" stroke="#6d655e" strokeWidth="2" strokeDasharray="4 6" />
            <line x1="140" y1="60" x2="106" y2="108" stroke="#F92524" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="84" y1="120" x2="62" y2="139" stroke="#F92524" strokeWidth="2.5" strokeLinecap="round" />
            <g stroke="#F92524" strokeWidth="2.5" strokeLinecap="round"><line x1="85" y1="115" x2="99" y2="129" /><line x1="99" y1="115" x2="85" y2="129" /></g>
            <line x1="140" y1="60" x2="168" y2="88" stroke="#A435F0" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
            <line x1="168" y1="88" x2="193" y2="114" stroke="#A435F0" strokeWidth="2.5" strokeLinecap="round" opacity="0.28" />
            <line x1="193" y1="114" x2="218" y2="139" stroke="#A435F0" strokeWidth="2.5" strokeLinecap="round" opacity="0.1" />
            <circle cx="62" cy="150" r="11" fill="#000000" />
            <circle cx="218" cy="150" r="10" fill="#f0edea" stroke="#A435F0" strokeWidth="2.5" strokeDasharray="4 6" opacity="0.4" />
          </svg>
          <div className="grid grid-cols-2 gap-3">
            <p className="font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-center text-black">Her son<br />came back</p>
            <p className="font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-center text-[#A435F0]">The overlap<br />went with it</p>
          </div>
          <p className="font-display text-black text-center leading-[0.95] mt-4 uppercase" style={{ fontSize: "clamp(1.5rem, 7.5vw, 2rem)" }}>The ban ended both</p>
        </div>
        <div className="h-px bg-[#d5cdc4] mt-8 mb-4" />
        <div className="flex items-end justify-between gap-4">
          <p className="font-body text-[11px] leading-snug text-[#6d655e]">
            Source: EKUZO parent interview, July 2026.
          </p>
          <p className="font-display text-black text-[1.25rem] leading-none tracking-[0.08em] shrink-0">
            EKUZO.GG
          </p>
        </div>
      </div>
    </figure>
  );
}
