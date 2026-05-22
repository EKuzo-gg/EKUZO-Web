# EKUZO Email Asset CDN Tracker

Running log of every image uploaded to Klaviyo's image library. Paste the Klaviyo-returned URL next to each filename. When wiring the template, we find-and-replace the local filename tokens for these URLs in one pass.

**How to upload to Klaviyo:**
1. Klaviyo → Content → Images → Upload.
2. After upload, right-click the image → Copy image address → paste the URL below.
3. Keep filenames matching the `export/` folder so lookups stay simple.

---

## Shared assets (used across multiple emails)

| Filename | Purpose | Dimensions (file / displayed) | Klaviyo CDN URL |
|---|---|---|---|
| `ekuzo-logo-white@2x.png` | Header logo | 592×114 / 120×auto | https://d3k81ch9hvuctc.cloudfront.net/company/UMWwrM/images/d8e58b70-f205-4198-82bb-76531c7ff71b.png |
| `ekuzo-caret-black@2x.png` | ~~CONFIRMED badge icon~~ (retired — replaced by check-in-circle) | 64×64 / 20×20 | https://d3k81ch9hvuctc.cloudfront.net/company/UMWwrM/images/0bdf2894-e76d-448c-ac99-a5248b48f587.png |
| `check-mark-black@2x.png` | CONFIRMED badge icon (monoline 90° check in circle) | 40×40 / 20×20 | https://d3k81ch9hvuctc.cloudfront.net/company/UMWwrM/images/7d993bad-aba4-46d3-ad79-5dc956eb29d7.png |
| `social-discord-icon-white@2x.png` | Footer social | 96×96 / 28×28 | https://d3k81ch9hvuctc.cloudfront.net/company/UMWwrM/images/8eff6e48-abdc-4652-950e-59a883cb7ca0.png |
| `social-tiktok-icon-white@2x.png` | Footer social | 96×96 / 28×28 | https://d3k81ch9hvuctc.cloudfront.net/company/UMWwrM/images/7decb2ab-06ad-4476-b3aa-43eb9d58d96c.png |
| `social-instagram-icon-white@2x.png` | Footer social | 96×96 / 28×28 | https://d3k81ch9hvuctc.cloudfront.net/company/UMWwrM/images/9a38fb40-a151-4e00-88dc-2636a4e4252d.png |
| `social-facebook-icon-white@2x.png` | Footer social | 96×96 / 28×28 | https://d3k81ch9hvuctc.cloudfront.net/company/UMWwrM/images/67a4a05f-1888-4ee1-897c-2b7b376bc10d.png |
| `social-youtube-icon-white@2x.png` | Footer social | 96×96 / 28×28 | https://d3k81ch9hvuctc.cloudfront.net/company/UMWwrM/images/f4c23b33-1bb4-4215-b2ce-c9b6248f57e6.png |
| `social-twitch-icon-white@2x.png` | Footer social | 96×96 / 28×28 | https://d3k81ch9hvuctc.cloudfront.net/company/UMWwrM/images/58c4c7b0-b2f0-435b-92fc-f2a54e8ac4ec.png |
| `social-linkedin-icon-white@2x.png` | Footer social | 96×96 / 28×28 | https://d3k81ch9hvuctc.cloudfront.net/company/UMWwrM/images/f601ea66-d243-4ef9-9a0f-0354922d4d4a.png |
| `social-x-icon-white@2x.png` | Footer social | 96×96 / 28×28 | https://d3k81ch9hvuctc.cloudfront.net/company/UMWwrM/images/08aee8d3-2b4a-4044-8fc7-3a4f9760623a.png |

## 01 — Purchase Confirmation

| Filename | Purpose | Dimensions (file / displayed) | Klaviyo CDN URL |
|---|---|---|---|
| `icon-small-squads@2x.png` | For Parents card icon — Small Squads | 72×72 / 36×36 | https://d3k81ch9hvuctc.cloudfront.net/company/UMWwrM/images/ce9ca04b-8b48-4795-984a-659aca4e4137.png |
| `icon-vetted-coaches@2x.png` | For Parents card icon — Vetted Coaches | 72×72 / 36×36 | https://d3k81ch9hvuctc.cloudfront.net/company/UMWwrM/images/0b6d959c-1874-4c8f-a454-1c32b7827ae6.png |
| `icon-safe-servers@2x.png` | For Parents card icon — Safe Servers | 72×72 / 36×36 | https://d3k81ch9hvuctc.cloudfront.net/company/UMWwrM/images/969335d5-5644-4cee-b9e8-2c5605d0ef4b.png |
| `icon-life-skills@2x.png` | For Parents card icon — Life Skills | 72×72 / 36×36 | https://d3k81ch9hvuctc.cloudfront.net/company/UMWwrM/images/dd0c2a5e-2bec-4d93-a0f7-740cfd126503.png |
| `hero-bg@2x.jpg` | Hero background behind "YOU'RE IN" | 1200×600 / 600×300 | _TBD_ |
| `avatar-empty@2x.png` | Empty squad roster spot | 160×160 / 80×80 | _TBD_ |
| `callout-gaming-matters@2x.jpg` | Gaming Matters callout bg | 1200×400 / 600×200 | _TBD_ |

## Notes

- 2x export convention: file is 2× the displayed size for retina sharpness.
- Transparent PNG for logos/icons; JPG for photos/backgrounds.
- Target <200KB per asset.
- Always include alt text in the template HTML.
