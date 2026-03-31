# SlopMachine v5

**Path:** `A:\Apps\slopmachine_v5`

Full AI content factory. Our production engine — not for public sale.

---

## What It Is

30+ Modal workers for AI-powered content generation and processing. Uses Remotion for video composition.

Key workers used by the YT pipeline:
- `remotion-segmentation` — animated text overlays per avatar config (templates, backgrounds, aspect ratio)
- `silence-removal` — auto-editor removes pauses (margin 0.2s, threshold 0.04)

Jobs submitted via SlopMachine gateway. Supabase used for job status polling.

---

## Keys & Config

- `.env` at `A:\Apps\slopmachine_v5\.env`
- Contains: Modal, ElevenLabs, Google, Runway, Kling, Stripe, etc.

---

## Notes

- Runs on Modal (cloud GPU workers) — no local GPU required for most tasks
- Remotion handles video composition with per-avatar templates
- This is the backbone infrastructure — handle with care
