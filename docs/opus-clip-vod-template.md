# Opus Clip Template — EKUZO VOD Review Clips

Reference settings for generating short vertical clips from Karlin's VOD review sessions. Goal: consistent, on-brand output across every export so EKUZO clips look like a recognizable series rather than ad-hoc edits.

**Companion doc:** `obs-vod-recording-setup.md` (how to record the source files so this template works cleanly).

---

## Source video assumptions

This template assumes one of:
1. **Pre-stacked source** (recommended): gameplay on top, Karlin cam on bottom, exported as a single 9:16 MP4 before uploading to Opus. See OBS setup doc.
2. **Composited source** (legacy): Karlin's cam in lower-left of gameplay. Workable but less clean — see "Composited source workarounds" below.

---

## Layout settings

| Setting | Value | Notes |
|---|---|---|
| Aspect ratio | 9:16 (vertical) | Primary output for Shorts, Reels, TikTok |
| Secondary export | 1:1 (square) | Optional, for LinkedIn / Instagram feed |
| Layout template | Split / Stacked | Two zones, vertical divider |
| Split ratio | 70 / 30 | Gameplay top (70%), Karlin bottom (30%) |
| Top zone source | Gameplay region | Full width, framed on action |
| Bottom zone source | Karlin cam region | Full width, face-tracked center |

**For pre-stacked sources:** disable Opus's auto-reframe — the layout is already correct. Just let Opus clip the timeline.

**For composited sources:** use Opus's manual crop tool to define the two zones. Accept that a small Karlin will appear in the top-right or top-left corner of the gameplay zone (it's the original cam overlay). Viewers parse it as stream UI and ignore it.

---

## Caption settings

| Setting | Value |
|---|---|
| Position | Bottom-center, overlaying lower third of Karlin |
| Font | Bold sans-serif (Inter Bold, Montserrat Bold, or Opus default "Reels" preset) |
| Size | Large — readable on phone at arm's length |
| Color | White text, black outline (1-2px) OR black pill background with white text |
| Animation | Word-by-word highlight in EKUZO red (`#E63946` or matched to brand) |
| Max lines | 2 |
| Profanity filter | ON |

Save this as a brand caption template inside Opus → "EKUZO VOD" preset so every future export pulls the same style.

---

## Hook detection & clip selection

- Enable AI hook detection — but **always review the picked hooks before exporting.**
- Opus tends to pick energy spikes (Karlin reacting loudly, gameplay kill moments). For coaching content, the teaching moments are the asset, not the reactions.
- Look for clips where Karlin is explaining a concept, calling out a decision, or reviewing a specific tactical moment — those are the ones worth posting.
- Target clip length: **30–60 seconds.** Anything shorter loses the teaching context, anything longer loses retention.
- Reject any clip where Karlin says something out of context that could be misread on its own.

---

## Branding overlays

- **Logo:** small EKUZO mark, top-left corner of the gameplay zone, 8% width, 70% opacity
- **Lower-third name tag** (optional): "Karlin Lewis — Head Coach" on the bottom Karlin zone, first 3 seconds of each clip
- **End card:** 2-second outro frame with EKUZO logo + "Train with us at ekuzo.gg" — Opus supports a static end-card image upload

Save logo and end-card files in `/EKUZO-Marketing/opus-clip-assets/` (create folder if needed).

---

## Per-clip QA checklist

Before downloading and posting any Opus clip, scan it for:

- [ ] Captions readable on a phone screen (zoom out to 50% in the Opus preview to simulate phone size)
- [ ] No profanity slipped through
- [ ] Karlin's face is visible and centered in the bottom zone (not cut off by face-tracking failure)
- [ ] Gameplay zone shows the action being discussed (not stuck on a loading screen or menu)
- [ ] Hook in the first 3 seconds makes you want to keep watching
- [ ] Clip ends on a complete thought, not mid-sentence
- [ ] EKUZO logo present

---

## Export & posting

- Export as MP4, 1080×1920, 30fps, high quality
- Filename: `ekuzo-vod-{topic}-{YYYY-MM-DD}.mp4` (e.g. `ekuzo-vod-jungle-pathing-2026-05-21.mp4`)
- Save to `/EKUZO-Marketing/opus-clip-outputs/` (create folder if needed)
- Cross-post: YouTube Shorts → TikTok → Instagram Reels → LinkedIn (in that order, spaced 1-2 hours apart to let each platform fingerprint the upload independently)

---

## Iterating on the template

This template is the starting point, not a contract. After the first batch of clips ships:
- Note which clips performed best on each platform
- Adjust caption style, hook length, or split ratio based on what's working
- Update this doc with the changes so future sessions don't drift

Owner: Aaron (visual / template), Karlin (content selection).
