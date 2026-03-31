# YT Transcript Pipeline

**Path:** `A:\Apps\yt-transcript`

Full content pipeline from YouTube source video to post-ready avatar video.

---

## The 7 Stages

**Stage 1: Scrape**
Daily cron scrapes new videos (last 24h) from 19 business/finance YouTube channels → URLs added to `videos.csv`

**Stage 2: Transcribe**
Whisper transcribes locally → saves to `transcripts/all/scripts/new/`
- Currently 2485 unprocessed scripts as of 2026-03-25

**Stage 3: Outline**
Process scripts using `docs/script_enhancement.md` as instructions → creates outlines in `transcripts/all/outlines/new/` → moves processed scripts to `scripts/processed/`
- ⚠️ Outline length determines final script length. Target 50-100KB outlines.
- Existing good outlines are 57-110KB. If outline is too short, the script will be too short.

**Stage 4: Rewrite & Categorize**
Takes outlines from `outlines/new/` → sends to Claude/GPT APIs → generates condensed scripts → categorizes into `categorized_scripts/{category}/`

**Stage 5: Assign to Avatar**
Pick script from `categorized_scripts/` → copy to `avatar_scripts/{avatar}/ready_scripts/`
- Girls (Eden, Sophie, Jesse, Star): dating-advice
- Josh: entrepreneurship, marketing, social media (everything except sales & business ops)
- Kai, Mike: in transition (TBD)

**Stage 6: Browser Automation**
Picks up from `ready_scripts/` → ElevenLabs TTS → HeyGen avatar video → downloads to `A:/videos/heygen_output/new/`
See: `context/browser-automation.md`

**Stage 7: Post-Production** (`A:\Apps\browser-automation\automation_pipeline.py`)
Scans `heygen_output/new/` → uploads to BunnyCDN → submits TWO parallel jobs to SlopMachine gateway:
- `remotion-segmentation` — animated text overlays per avatar config (templates, backgrounds, aspect ratio)
- `silence-removal` — auto-editor removes pauses (margin 0.2s, threshold 0.04)
Polls Supabase for completion → downloads processed segments → archives originals

---

## Operational Notes (learned 2026-03-25)

- Avatar config keys are now simplified: Josh, Kai, Eden, Sophie, Jesse (no numbers)
- Chrome profile 1 = men (Josh, Kai), profile 2 = women (Eden, Sophie, Jesse)
- Profiles stay logged in via saved cookies — only need manual login if cookies expire
- `upload_existing_audio.py` — resumes from audio upload stage (skips ElevenLabs if audio exists)
- Script file format: Line 1 = title (NOT spoken), Line 2+ = spoken content
- Avatar filename prefix (`{avatar}_{title}.mp4`) required for custom Remotion templates
- Outline quality determines script length — target 50-100KB outlines for 5,000-10,000 word scripts
- Girls share dating scripts but never in the same week — track via processed folders
- Thumbnail captions: short, scroll-stopping, curiosity-driven > literal titles

## Costs

~$0.09/outline + $0.24/script + $0.18/tone = **~$0.50 per final script**

## Niche

Business / finance / entrepreneurship
