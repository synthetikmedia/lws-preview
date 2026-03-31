# Lightwave Solar — Phone System

**Client:** Lightwave Solar
**Status:** ✅ Built, tested, and live — 2026-03-30
**Owner:** Fountainhead LLC / Devin

---

## Overview

A Twilio-powered IVR phone system integrated into the `fountainhead-textback` FastAPI app. Callers dial a Lightwave Solar number, navigate an IVR menu, get routed to a live agent via sequential dialing, or leave a voicemail if all agents are unavailable. All answered calls and voicemails are recorded, uploaded to Supabase Storage, and analyzed by AI (Whisper + GPT-4o-mini). Call events and AI summaries are logged in real time to Monday.com.

---

## Infrastructure

| Item | Value |
|---|---|
| App | `A:\Apps\fountainhead-textback` |
| Hosting | Fly.io → `https://fountainhead-textback.fly.dev` |
| Twilio number | +16159035532 (615-903-5532) |
| Supabase project | TextBack project (`zleojlihduagiwewqsjt`) |
| Supabase Storage bucket | `call-recordings` (public) |
| Monday.com board | LWS - Small Projects (ID: `18406073661`) |
| Monday.com phone column | `lead_phone` |
| Monday.com API key env | `MONDAY_API_KEY_LIGHTWAVE` |
| Python | Windows Python 3.12 at `C:\Users\canaa\AppData\Local\Programs\Python\Python312\` |

### Twilio Webhook URLs
| Purpose | URL |
|---|---|
| Incoming call (voice webhook) | `POST https://fountainhead-textback.fly.dev/phone/incoming` |
| Call status callback | `POST https://fountainhead-textback.fly.dev/phone/status` |
| Recording ready callback | `POST https://fountainhead-textback.fly.dev/phone/recording-status` |

---

## Files

| File | Purpose |
|---|---|
| `phone_routes.py` | IVR webhooks, sequential dial logic, voicemail handler, recording-status handler, background AI tasks |
| `phone_admin_routes.py` | CRUD REST API for departments, agents, call logs, voicemails |
| `storage.py` | Supabase Storage upload helper + Whisper/GPT-4o-mini AI analysis pipeline |
| `monday_client.py` | Monday.com GraphQL API client — find/create items, log call events, AI summaries |
| `static/phone-admin.html` | Dark-themed admin panel (4 tabs: Calls, Voicemails, Agents, Departments) |
| `migrations/phone_system.sql` | DB schema — already applied to Supabase |
| `run_migration.py` | DB migration runner script |
| `check_imports.py` | Import/dependency checker |
| `test_monday.py` | Monday.com unit tests (mocked) |
| `test_monday_live.py` | Monday.com live integration tests |
| `test_storage.py` | Supabase Storage upload tests |
| `test_ai_summary.py` | AI analysis pipeline tests |

Both routers are mounted in `app.py`:
- Phone IVR: `prefix="/phone"`
- Phone Admin: `prefix="/admin/phone"`

---

## Call Flow (Current)

```
Caller dials 615-903-5532
        │
        ▼
POST /phone/incoming
  IVR: "Press 1 Sales, 2 Service, 3 Billing"
        │
        ▼
POST /phone/route
  Looks up department from digit
  Fetches active agents ordered by priority
  Logs call to phone_calls (status: ringing)
  Finds or creates Monday.com lead item by phone number
        │
        ▼
 ┌── Agents available? ──┐
 │                       │
 ▼                       ▼
Dial agent (15s)    No agents → voicemail
  │
  ▼
POST /phone/dial-next (action callback)
  ├── Answered → update call status
  │     └── POST /phone/recording-status (when recording ready)
  │             ├── Download MP3 from Twilio
  │             ├── Upload to Supabase Storage (call-recordings bucket)
  │             ├── Save public URL to phone_calls.recording_url
  │             ├── Log call update to Monday.com
  │             └── [background] Whisper transcription → GPT-4o-mini summary
  │                    ├── Save transcript to phone_calls.transcript
  │                    └── Post 🤖 AI Call Summary to Monday.com item
  └── No answer → try next agent or voicemail
        │
        ▼
POST /phone/voicemail
  Download MP3 from Twilio
  Upload to Supabase Storage
  Save public URL to phone_voicemails.recording_url
  Find or create Monday.com lead item
  [background] Whisper → GPT-4o-mini
    ├── Save transcript to phone_voicemails.transcript
    └── Post single combined update to Monday.com:
        📬 Voicemail + 🎧 Recording URL + 🤖 AI Summary + 📝 Transcript
```

**Key behavior:**
- Each agent ring timeout: **15 seconds**
- Answered calls: recorded as MP3 (`record-from-answer`)
- Voicemails: up to 2 minutes, plays beep
- IVR voice: Amazon Polly (Joanna)
- AI analysis: background task — never blocks Twilio response
- Voicemail Monday.com update: **one combined post** (not two separate updates)

---

## AI Analysis Pipeline

**Answered calls:**
1. Twilio fires `POST /phone/recording-status` when recording is ready
2. `storage.upload_recording_to_supabase()` downloads MP3 from Twilio, uploads to Supabase Storage
3. Public URL saved to `phone_calls.recording_url`
4. Background task calls `storage.analyze_recording(public_url, call_sid)`
5. `analyze_recording()` → Whisper transcription → GPT-4o-mini 2-3 sentence summary
6. Transcript saved to `phone_calls.transcript`
7. `monday_client.log_ai_summary(item_id, summary, transcript)` posts `🤖 AI Call Summary` update

**Voicemails:**
1. Voicemail handler in `POST /phone/voicemail` uploads to Supabase Storage
2. Background task calls same `analyze_recording()` pipeline
3. Transcript saved to `phone_voicemails.transcript`
4. `monday_client.log_voicemail_with_summary()` posts **single combined** update:
   - `📬 Voicemail — {dept} dept`
   - `🎧 Recording: {url}`
   - `🤖 AI Summary: {summary}`
   - `📝 Transcript: {transcript}`

**Models:** OpenAI `whisper-1` (transcription), `gpt-4o-mini` (summary, max 200 tokens)

---

## Monday.com Integration

**Board:** LWS - Small Projects (`18406073661`)  
**Phone column:** `lead_phone`  
**API key:** `MONDAY_API_KEY_LIGHTWAVE` env var

**On every inbound call:**
1. Search board for item matching caller's phone (tries E.164, formatted, bare digit variants)
2. If not found: create new item with caller's phone and department
3. After call ends / recording is ready: log call event update to item timeline
4. After AI analysis: log AI summary update to same item

**Monday.com update types:**
- `📞 Inbound call — {dept} dept` — answered call with recording link
- `🤖 AI Call Summary` — transcript + GPT summary for answered calls
- `📬 Voicemail — combined` — voicemail recording + AI summary + transcript in one update
- `📋 New lead created` — initial note when item is auto-created

**In-memory correlation:** `_active_calls` dict in `phone_routes.py` maps `CallSid → {item_id, dept}` for the duration of a call, so recording-status and dial-next callbacks can find the right Monday.com item.

---

## Database Tables (TextBack Supabase project)

| Table | Purpose |
|---|---|
| `phone_departments` | Departments (Sales, Service, Billing) |
| `phone_agents` | Agents per department — name, phone number, priority, active flag |
| `phone_calls` | Every call: from/to, department, status, duration, recording_url, transcript |
| `phone_voicemails` | Voicemail recordings: recording_url, transcript, listened flag |

**Notable columns:**
- `phone_calls.transcript TEXT` — added 2026-03-28 (Whisper output)
- `phone_voicemails.transcript TEXT` — present since initial schema

### Seeded Data
- **Departments:** Sales, Service, Billing (3)
- **Agents:** 4 placeholder agents (Sales Agent 1 = `+16158815452` for testing, others are dummy numbers)
- Replace placeholder agents with real Lightwave Solar staff numbers via admin UI before go-live

---

## Admin Portal

**URL:** http://localhost:8888/static/phone-admin.html  
(or via Fly.io: `https://fountainhead-textback.fly.dev/static/phone-admin.html`)

**Tabs:**
1. **Calls** — call log table (from, dept, status, duration, recording link)
2. **Voicemails** — voicemail list with playback link, mark listened
3. **Agents** — add/edit/delete agents, assign to departments, set priority
4. **Departments** — add/edit/delete departments

---

## Production Checklist

| Item | Status |
|---|---|
| IVR routing + sequential dial | ✅ Done |
| Voicemail recording | ✅ Done |
| Call recording (Supabase Storage) | ✅ Done |
| AI transcription + summary | ✅ Done |
| Monday.com integration | ✅ Done |
| Replace placeholder agent numbers | ⏳ Pending (client action) |
| Auto-start on reboot (Task Scheduler) | ❌ Not set up |
| Move to VPS | ❌ Not yet (post-revenue) |
| Create `businesses/lightwave.json` for TextBack | ⏳ Pending |

---

## Relationship to TextBack

This phone system runs **inside the same FastAPI process** as TextBack. They share:
- The same Supabase project
- The same `.env` file (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, etc.)
- The same Fly.io deployment (`fountainhead-textback.fly.dev`)

TextBack handles: missed calls → send AI text (via `/missed-call`, `/incoming-sms`, `/call-status`)  
Phone System handles: live call routing → IVR → agents → voicemail → recording → AI (via `/phone/*`)

These are separate Twilio numbers with separate webhook configs. No conflicts.

---

## Env Variables

```
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=+16159035532      # Phone system number
IVR_GREETING=Thank you for calling Lightwave Solar.
OPENAI_API_KEY=                        # Used for Whisper + GPT-4o-mini
SUPABASE_URL=
SUPABASE_KEY=
SUPABASE_SERVICE_KEY=                  # Used by storage.py for Storage uploads
MONDAY_API_KEY_LIGHTWAVE=              # Lightwave Solar Monday.com API key
```

---

## Architecture Notes

- **No Twilio Studio** — pure TwiML webhooks via FastAPI
- **No TaskRouter** — sequential dial via `<Dial>` action callbacks
- **Recording:** `record-from-answer` on every `<Dial>` — only records actually answered calls
- **Storage:** MP3s stored in Supabase `call-recordings` bucket (public) — auth-free playback in admin UI
- **AI:** Runs as FastAPI `BackgroundTask` — Twilio always gets a 200 immediately
- **Monday.com:** In-memory `_active_calls` dict ties CallSid to item_id across multiple webhook callbacks
- **Fallback:** If Supabase upload fails, raw Twilio URL is used for `recording_url`; AI analysis is skipped

---

*Last updated: 2026-03-28*  
*Built by: Devin / Fountainhead LLC*
