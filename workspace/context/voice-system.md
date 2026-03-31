# Voice System

> ⚠️ **STATUS: DISABLED / INACTIVE**
> Voice system was working as of 2026-03-25 but is not currently in active use.
> The ngrok domain `devin-livekit.ngrok.io` is free to repurpose.

---

## Architecture

Deepgram STT (streaming) → GPT-4o-mini → Cartesia TTS (streaming)

**Platform:** LiveKit self-hosted on WSL2
**Web UI:** http://localhost:3000
**Voice:** Brooke (Cartesia, ID: `e07c00bc-4134-4eae-9ea4-1a55fb45746b`)

---

## File Paths (WSL2)

| Component | Path |
|-----------|------|
| LiveKit server | `/home/apps/livekit/livekit-server` (port 7880) |
| Voice agent | `/home/apps/livekit/voice_agent.py` |
| Web server | `/home/apps/livekit/web_server.py` (port 3000) |
| Web UI | `/home/apps/livekit/web/index.html` |
| Kill script | `/home/apps/livekit/kill_agent.sh` |
| Env file | `/home/apps/livekit/.env` |
| Python venv | `/home/apps/livekit-agent-venv` (Python 3.11) |

## Windows Scripts

- **Start:** `A:\Apps\devin-voice\start-voice.bat`
- **Stop:** `A:\Apps\devin-voice\stop-voice.bat`

---

## Voice-Text Sync

- Click mic → reads MEMORY.md + daily notes + voice-sync.md → injects into voice session
- Sync file: `memory/voice-sync.md` (manually updated for now)
- Voice-Devin routes through OpenClaw gateway (same brain as text-Devin)
- TODO: auto-save voice transcripts back to memory when call ends

---

## Also Installed (not currently active)

- **Orpheus TTS** (local CUDA) — Tara voice, llama.cpp + Orpheus-FastAPI
- **Discord bot** (DevinVoice#7467) — `A:\Apps\devin-voice\bot.py`

---

## Keys

- Deepgram, Cartesia, LiveKit keys in `/home/apps/livekit/.env`
- Discord bot token in `A:\Apps\devin-voice\.env`
