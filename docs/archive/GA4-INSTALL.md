# GA4 Installation Guide — ekuzo.gg

## Measurement ID
**G-8LM45PX53W**

Google Analytics account: EKUSO (rename to EKUZO) → property: ekuso.gg - GA4

## What to do

Add the Google Analytics gtag script to `app/layout.tsx`. This is the root layout for the entire site, so every page will be tracked.

### 1. Add the import at the top of layout.tsx

```tsx
import Script from "next/script";
```

### 2. Add the GA scripts inside `<head>`, after the JSON-LD script

```tsx
<head>
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
  />

  {/* Google Analytics */}
  <Script
    src="https://www.googletagmanager.com/gtag/js?id=G-8LM45PX53W"
    strategy="afterInteractive"
  />
  <Script id="ga4-init" strategy="afterInteractive">
    {`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-8LM45PX53W');
    `}
  </Script>
</head>
```

### 3. Optional: use an env variable instead of hardcoding

Add to `.env.local`:
```
NEXT_PUBLIC_GA_ID=G-8LM45PX53W
```

Then reference it in layout.tsx:
```tsx
const gaId = process.env.NEXT_PUBLIC_GA_ID;
```

And replace the hardcoded ID with `${gaId}` in both Script tags. This lets you disable analytics in dev by leaving the env var unset.

## Events to track later (marketing priorities)

Based on EKUZO's 2026 goals and content framework, these are the custom events Aaron and the team should set up once the base tag is live:

| Event | Trigger | Why |
|---|---|---|
| `sign_up_start` | User clicks "Register" on any program page | Top of funnel — measures intent |
| `sign_up_complete` | Stripe checkout success callback | Bottom of funnel — actual conversion |
| `newsletter_subscribe` | Beehiiv form submission | Content flywheel metric |
| `program_page_view` | Pageview on /programs/ekuzo-camps, /ekuzo-teams, /ekuzo100 | Which programs drive interest |
| `cta_click` | StickyCTA or any "Join" button click | Measures CTA effectiveness |
| `video_play` | If/when video embeds are added | Content engagement |
| `faq_expand` | FAQ accordion open | What questions families care about |
| `school_inquiry` | Form submit on /schools | B2B lead tracking |

## Rename the GA account

In Google Analytics → Admin → Account Settings, change "EKUSO" to "EKUZO". Also rename the property from "ekuso.gg - GA4" to "ekuzo.gg".

## Verify it's working

After deploying, open https://ekuzo.gg, then check GA4 → Realtime → you should see yourself as an active user within 30 seconds.
