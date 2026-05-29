# OBS Setup — Recording VOD Reviews for Opus Clip

**Goal:** record Karlin's webcam and the gameplay as two separate, synchronized video files so Opus Clip can stack them in a clean split-screen layout without having to crop around a composited PIP overlay.

**Problem this solves:** in our current setup, Karlin's cam is composited into the lower-left of the recording. When Opus Clip tries to make a vertical split-screen clip, the top "gameplay" zone still contains a tiny Karlin in the corner, and the bottom "Karlin" zone has to be cropped from a small region. Recording them separately fixes this at the source.

---

## Recommended approach: Source Record plugin

The OBS **Source Record** plugin lets you record an individual source (e.g. the webcam) to its own file *while* OBS's main recording captures the full scene. The two files are written simultaneously with matching timestamps, so they line up perfectly in any editor or in Opus Clip.

### One-time setup

1. **Install Source Record plugin**
   - Download from https://obsproject.com/forum/resources/source-record.1285/
   - Quit OBS, run the installer, reopen OBS
   - Verify: right-click any source → you should see "Filters" → and inside Filters, "Source Record" should appear in the filter list

2. **Set up the main gameplay recording**
   - Create a scene called `VOD-Gameplay` that contains **only the game capture** (no webcam, no overlays)
   - Settings → Output → Recording: set output folder, format MP4, encoder x264 or NVENC, quality "Indistinguishable"
   - This scene's recording = clean gameplay footage

3. **Set up the webcam source-record filter**
   - In your normal streaming/recording scene (the one with the cam in the lower-left), right-click the **Webcam source** → Filters
   - Click `+` under Effect Filters → add **Source Record**
   - Configure the filter:
     - Path: same folder as your main recordings (e.g. `~/Movies/EKUZO-VOD/`)
     - Filename formatting: `karlin-cam-%CCYY-%MM-%DD-%hh-%mm-%ss`
     - Container: `mp4`
     - Video encoder: `x264` (or NVENC if you have an NVIDIA GPU)
     - Bitrate: 6000 Kbps is plenty for a cam crop
     - Record audio: ON (Karlin's mic) — this gives you a backup audio track aligned with the cam
   - Click OK

### Per-session workflow

1. Switch to the `VOD-Gameplay` scene before hitting record
2. Press **Start Recording** in OBS — this writes the gameplay file
3. The Source Record filter on the webcam will automatically start writing the cam file at the same moment
4. Record the session normally
5. Press **Stop Recording** — both files finalize together

You'll end up with two files in your output folder:
- `VOD-2026-05-21-14-30-00.mp4` (gameplay, full frame, no cam)
- `karlin-cam-2026-05-21-14-30-00.mp4` (cam only, full frame)

Both files are byte-aligned in time. No sync drift.

---

## Importing into Opus Clip

Opus Clip works best with a single uploaded video, so do a quick pre-stack in any editor (CapCut, Descript, Premiere, even iMovie). Five minutes max:

1. Drop the gameplay file on the top half of a 9:16 canvas (1080×1920)
2. Drop the cam file on the bottom half
3. Set the divider to roughly 70/30 (gameplay 1344px tall, cam 576px tall)
4. Export as a single MP4
5. Upload that pre-stacked file to Opus Clip

Now Opus Clip's job is just clipping, captioning, and picking hooks — no layout gymnastics needed, because the layout is already baked in.

**Alternative if you don't want to pre-stack:** upload the two files separately to Opus and use their dual-source feature (currently in beta on the paid plans). Pre-stacking is more reliable.

---

## Fallback: if you can't install Source Record

Run OBS for gameplay only (no cam in the scene), and use **QuickTime Player → New Movie Recording** on a second app (or a phone) pointed at Karlin to capture the cam separately. Click record on both within ~1 second of each other. Sync isn't perfect but a 1-frame nudge in the editor fixes it.

This is more error-prone than the plugin route. Use it only as a stopgap.

---

## Quality checklist before each session

- [ ] OBS scene = `VOD-Gameplay` (no webcam overlay)
- [ ] Source Record filter on webcam is enabled (right-click cam → Filters → Source Record should be listed)
- [ ] Output folder has free space (1 hour of dual recording ≈ 8GB)
- [ ] Karlin's mic is going into both OBS *and* the Source Record filter (so the cam file has voice as a backup track)
- [ ] Test 30 seconds before the real session and verify both files appear in the output folder
