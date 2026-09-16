// Sentry Phase 4: P6 - copy fidelity against 02-copy-deck.md.
// For each variant: every deck string (popup + sticky) must appear
// verbatim (case-sensitive) in the rendered dialog/bar innerText.
// Every contact option label must appear in the select. Zero em-dashes
// anywhere in rendered innerText of bar, dialog, select.
import { AFTER, BLOG_POST, withPage, makeRecorder, log } from "./sentry-common.mjs";

const { ok, summary } = makeRecorder();

const EM_DASH = "—";

const POPUP_COPY = {
  thumbs: {
    eyebrow: "The EKUZO weekly",
    headline: "One email after you read this. Then you decide.",
    body: "Leave your address and you're on the list today. Tomorrow I'll send one message with a thumbs up and a thumbs down, and the thumbs down takes you straight off, no questions. Thumbs up and the weekly keeps coming: what I'm seeing in kids' gaming, sources attached.",
    byline: "Karlin Oei, founder, EKUZO",
    firstNamePlaceholder: "First name (optional)",
    emailPlaceholder: "Email address",
    button: "Send me the one email",
    microcopy: "No spam. Unsubscribe any time, or use the thumbs down tomorrow.",
  },
  classic: {
    eyebrow: "The EKUZO weekly",
    headline: "For parents of gamers, once a week.",
    body: "One email a week on making gaming count. I coach kids who play, so it's what I'm actually seeing. Sources attached, no hype.",
    byline: "Karlin Oei, founder, EKUZO",
    firstNamePlaceholder: "First name (optional)",
    emailPlaceholder: "Email address",
    button: "Join the weekly",
    microcopy: "No spam. Unsubscribe any time.",
  },
};

const STICKY_COPY = {
  thumbs: { line: "One email tomorrow, then you decide to stay or go.", button: "Try it" },
  classic: { line: "One email a week on kids and gaming, with the sources.", button: "Join" },
};

const CONTACT_OPTIONS = [
  "Choose one",
  "X (Twitter)",
  "Instagram",
  "TikTok or YouTube",
  "Google search",
  "ChatGPT or another AI",
  "A friend or another parent",
  "My kid's school",
  "Other",
];
const CONTACT_LABEL = "How did you hear about us?";
const CONTACT_HELPER = "Optional. It tells us where parents are finding us.";

async function main() {
  for (const variant of ["thumbs", "classic"]) {
    await withPage({ width: 1440, height: 900 }, async (page, context) => {
      await context.addInitScript((v) => {
        try {
          window.localStorage.setItem("ekuzo_nl_variant", v);
        } catch {}
      }, variant);
      await page.goto(`${AFTER}${BLOG_POST}`);

      // ---- Sticky bar copy fidelity ----
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(400);
      const bar = page.locator("div.fixed.bottom-0.left-0.right-0.z-40").first();
      const barText = await bar.innerText();
      for (const [field, value] of Object.entries(STICKY_COPY[variant])) {
        const exact = barText.includes(value);
        const caseInsensitive = barText.toUpperCase().includes(value.toUpperCase());
        ok(
          `P6 [${variant}] sticky.${field} present in bar innerText (case-insensitive; "line" renders through a CSS uppercase transform, noted separately)`,
          caseInsensitive,
          `exact-case match=${exact} | expected: "${value}" | got: "${barText}"`
        );
        if (caseInsensitive && !exact) {
          ok(
            `P6 [${variant}] sticky.${field} rendered in exact deck case (not CSS-transformed)`,
            false,
            `field "${field}" only matches after uppercasing both sides -- it is rendered all-caps via a CSS text-transform`
          );
        }
      }
      ok(`P6 [${variant}] sticky bar innerText has zero em-dashes`, !barText.includes(EM_DASH), barText);

      // ---- Popup copy fidelity ----
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.55));
      await page.waitForSelector('[role="dialog"]', { timeout: 3000 });
      await page.waitForTimeout(200);
      const dialog = page.locator('[role="dialog"]');
      const dialogText = await dialog.innerText();
      // Placeholders are checked separately below via the DOM placeholder
      // attribute -- innerText never includes placeholder text on an
      // empty input, so they are excluded from this loop.
      const { firstNamePlaceholder, emailPlaceholder, ...textFields } = POPUP_COPY[variant];
      for (const [field, value] of Object.entries(textFields)) {
        const exact = dialogText.includes(value);
        const caseInsensitive = dialogText.toUpperCase().includes(value.toUpperCase());
        ok(
          `P6 [${variant}] popup.${field} present in dialog innerText (case-insensitive check; exact-case noted)`,
          caseInsensitive,
          `exact-case match=${exact} | expected: "${value.slice(0, 60)}..."`
        );
        if (caseInsensitive && !exact) {
          ok(
            `P6 [${variant}] popup.${field} rendered in exact deck case (not CSS-transformed)`,
            false,
            `field "${field}" only matches after uppercasing both sides -- it is rendered all-caps via a CSS text-transform, so the literal deck string never appears in innerText`
          );
        }
      }
      // Placeholders aren't in innerText (they're attribute text on empty
      // inputs) -- check those separately via the DOM placeholder attribute.
      const firstNamePh = await dialog.locator('input[type="text"]').first().getAttribute("placeholder");
      const emailPh = await dialog.locator('input[type="email"]').first().getAttribute("placeholder");
      ok(`P6 [${variant}] firstName placeholder verbatim`, firstNamePh === POPUP_COPY[variant].firstNamePlaceholder, firstNamePh);
      ok(`P6 [${variant}] email placeholder verbatim`, emailPh === POPUP_COPY[variant].emailPlaceholder, emailPh);
      ok(`P6 [${variant}] dialog innerText has zero em-dashes`, !dialogText.includes(EM_DASH), dialogText);
    });
  }

  // ---- Contact select copy fidelity (variant-independent) ----
  await withPage({ width: 1440, height: 900 }, async (page) => {
    await page.goto(`${AFTER}/`);
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(400);
    await page.click("text=Talk to Humans");
    await page.waitForSelector("#contact-heard-about", { timeout: 5000 });
    const select = page.locator("#contact-heard-about");
    const optionTexts = await select.locator("option").allInnerTexts();
    for (const label of CONTACT_OPTIONS) {
      ok(`P6 contact select contains option "${label}"`, optionTexts.includes(label), optionTexts.join(" | "));
    }
    ok("P6 contact select has exactly 9 options (8 + default)", optionTexts.length === 9, optionTexts.length);

    const modalText = await page.locator("#contact-heard-about").locator("xpath=ancestor::div[3]").innerText();
    ok(`P6 contact field label "${CONTACT_LABEL}" present`, modalText.includes(CONTACT_LABEL), modalText);
    ok(`P6 contact helper text "${CONTACT_HELPER}" present`, modalText.includes(CONTACT_HELPER), modalText);

    const fullModalText = await page.locator('div.fixed.inset-0.z-\\[100\\]').innerText();
    ok("P6 contact modal innerText has zero em-dashes", !fullModalText.includes(EM_DASH), fullModalText);
  });

  const s = summary();
  process.exit(s.fail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
