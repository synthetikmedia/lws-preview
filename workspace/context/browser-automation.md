# Browser Automation Pipeline

**Path:** `A:\Apps\browser-automation`

**Role:** The execution engine for Stage 6–7 of the YT Transcript Pipeline. Also the main money-maker.

---

## What It Does

Automated AI avatar content factory:
1. Picks up scripts from `avatar_scripts/{avatar}/ready_scripts/`
2. Generates audio via ElevenLabs TTS
3. Submits to HeyGen for avatar video generation
4. Downloads completed videos to `A:/videos/heygen_output/new/`
5. Post-production: BunnyCDN upload → SlopMachine Remotion overlays + silence removal

Runs continuously. Rotates avatars automatically.

---

## Avatars (11 total)

| Avatar | Gender | Category |
|--------|--------|----------|
| Josh | Male | Entrepreneurship, marketing, social media |
| Kai (x3) | Male | In transition (TBD) |
| Mike | Male | In transition (TBD) |
| Eden | Female | Dating advice |
| Sophie | Female | Dating advice |
| Jesse | Female | Dating advice |
| Star (x3) | Female | Dating advice |

**Rule:** Girls share dating scripts but never the same script in the same week — track via processed folders.

---

## Chrome Profiles

- **Profile 1** — Men (Josh, Kai): HeyGen account #1
- **Profile 2** — Women (Eden, Sophie, Jesse): HeyGen account #2
- Profiles stay logged in via saved cookies
- Only need manual login if cookies expire

---

## Key Files

- **`start_pipeline.bat`** ← **USE THIS to start the pipeline** (runs `continuous_pipeline_multiscene.py` with `-u` unbuffered, correct working dir)
- `continuous_pipeline_multiscene.py` — Main pipeline loop (runs forever, rotates all avatars, picks up scripts from `ready_scripts/`)
- `automation_pipeline.py` — Post-production: BunnyCDN + SlopMachine submission + polling
- `upload_existing_audio.py` — Resume from audio upload stage (skips ElevenLabs if audio already exists)
- `.env` — ElevenLabs, Supabase, HeyGen keys

---

## Script Format

- Line 1: Title (NOT spoken aloud)
- Line 2+: Spoken content
- Filename prefix: `{avatar}_{title}.mp4` required for custom Remotion templates

---

## Avatar Config Keys

Simplified as of 2026-03-25: Josh, Kai, Eden, Sophie, Jesse (no numbers suffix)
