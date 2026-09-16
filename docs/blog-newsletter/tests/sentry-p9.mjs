// Sentry Phase 4: P9 - ContactModal "How did you hear about us?" select.
import { AFTER, withPage, shot, makeRecorder, log } from "./sentry-common.mjs";

const { ok, summary } = makeRecorder();

async function openContact(page) {
  await page.goto(`${AFTER}/`);
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(400);
  await page.click("text=Talk to Humans");
  await page.waitForSelector("#contact-heard-about", { timeout: 5000 });
}

async function main() {
  // Field present, default empty ("Choose one")
  await withPage({ width: 1440, height: 900 }, async (page) => {
    await openContact(page);
    const select = page.locator("#contact-heard-about");
    ok("P9: select#contact-heard-about is present", (await select.count()) === 1);
    const value = await select.inputValue();
    ok("P9: default value is empty string", value === "", value);
    const firstOptionText = await select.locator("option").first().innerText();
    ok('P9: default option text is "Choose one"', firstOptionText === "Choose one", firstOptionText);
    await shot(page, "sentry-p9-contact-select-1440");
  });

  // Optional: form submits without selecting it
  await withPage({ width: 1440, height: 900 }, async (page) => {
    let body = null;
    await page.route("**/api/contact", async (route) => {
      body = JSON.parse(route.request().postData() || "{}");
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
    });
    await openContact(page);
    await page.fill("#contact-name", "Jamie Test");
    await page.fill("#contact-email", "jamie-test@example.com");
    // Scope the submit click to the contact modal -- the homepage's own
    // FooterNewsletter form also has a button[type=submit] ("Sign up").
    await page.locator('#contact-heard-about').locator("xpath=ancestor::form").locator('button[type="submit"]').click();
    await page.waitForTimeout(300);
    ok("P9: form submits successfully without heardAbout selected", body !== null, JSON.stringify(body));
    ok("P9: heardAbout key absent from body when not selected", !("heardAbout" in (body || {})), JSON.stringify(body));
    const thanksVisible = await page.locator("text=Thanks for reaching out!").count();
    ok("P9: success screen shown after submit without heardAbout", thanksVisible > 0);
  });

  // Selecting a value includes it in the body as heardAbout
  await withPage({ width: 1440, height: 900 }, async (page) => {
    let body = null;
    await page.route("**/api/contact", async (route) => {
      body = JSON.parse(route.request().postData() || "{}");
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
    });
    await openContact(page);
    await page.fill("#contact-name", "Jamie Test");
    await page.fill("#contact-email", "jamie-test@example.com");
    await page.selectOption("#contact-heard-about", "x");
    await page.locator('#contact-heard-about').locator("xpath=ancestor::form").locator('button[type="submit"]').click();
    await page.waitForTimeout(300);
    ok('P9: heardAbout="x" included in /api/contact body when chosen', body?.heardAbout === "x", JSON.stringify(body));
  });

  // All 8 option values match the contract's slugs, in the correct order.
  await withPage({ width: 1440, height: 900 }, async (page) => {
    await openContact(page);
    const values = await page.locator("#contact-heard-about option").evaluateAll((opts) => opts.map((o) => o.value));
    const expected = ["", "x", "instagram", "tiktok-youtube", "google", "ai", "friend", "school", "other"];
    ok("P9: option values match the contract's 8 slugs plus default, in order", JSON.stringify(values) === JSON.stringify(expected), JSON.stringify(values));
  });

  const s = summary();
  process.exit(s.fail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
