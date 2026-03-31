# Fountainhead TextBack

**Path:** `A:\Apps\fountainhead-textback`

AI missed-call-to-text SaaS for small businesses.

---

## Tech Stack

- **Backend:** FastAPI
- **SMS:** Twilio
- **AI:** OpenAI
- **Database:** Supabase with pgvector RAG
- **Docs live at:** fountainhead.llc/privacy + fountainhead.llc/terms

---

## Ports & Access

- **Main app:** port 8888
- **Chat UI:** port 8889 — run `python chat_server.py` → http://localhost:8889
- **Ngrok:** `devin-voice.ngrok.io` → port 8888

---

## Supabase

- **URL:** https://zleojlihduagiwewqsjt.supabase.co
- Separate project from SlopMachine

---

## A2P Campaign

- Submitted: 2026-03-26
- Status: Pending approval (1-3 days)
- Strategy: One campaign for ALL customers (shared sender pool)

---

## Onboarding Process (~30 min/customer)

1. Create JSON config for customer
2. Create KB markdown (knowledge base)
3. Seed the database
4. Test in Chat UI
5. Provision Twilio number

---

## Next Steps (post-A2P approval)

1. **Customer portal** — web form to manage KB docs, auto-re-seeds on save
2. **Landing page** — dedicated TextBack sales page
3. **Stripe integration** — subscriptions + billing tied to customer accounts
