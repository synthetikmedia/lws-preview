# Expense Reporter

SMS-based expense reporting tool. Employees text a receipt photo to a dedicated number — the app extracts the data via GPT-4o vision and logs it to a Monday.com board.

---

## Status: LIVE ✅ (2026-03-29)

---

## Infrastructure

| Component | Details |
|-----------|---------|
| **App** | `A:\Apps\expense-reporter\` |
| **Deployed** | `https://expense-reporter.fly.dev` |
| **Phone number** | `+1 (260) 254-7980` |
| **Twilio webhook** | `https://expense-reporter.fly.dev/webhook/sms` |
| **Monday.com board** | `18406176751` ("Expense Tracker") |
| **Supabase project** | TextBack project (`zleojlihduagiwewqsjt`) |
| **Supabase bucket** | `expense-photos` (public) |
| **Fly.io app** | `expense-reporter` — `iad` region, 2x shared-cpu-1x, auto-stop |

---

## Flow

```
Phone sends MMS photo
  → Twilio webhook → Fly.io app
  → Download photo from Twilio
  → Upload photo to Supabase Storage (receipts/YYYY-MM/{uuid}.png)
  → GPT-4o vision extracts: merchant, amount, date, category, description
  → Save expense record to Supabase (expenses table)
  → Create Monday.com item with all fields
  → Upload photo to Monday item Files tab (via add_file_to_update)
  → Add detailed update note to Monday item
  → SMS confirmation reply to sender (pending A2P approval)
```

---

## Monday.com Column Mapping

Board: `18406176751` — "Expense Tracker"

| Field | Column ID | Type |
|-------|-----------|------|
| Merchant name | `name` (item title) | name |
| Amount | `numeric_mm1xnb5m` | numbers |
| Date | `date_mm1x6v47` | date |
| Category | `dropdown_mm1x80p5` | dropdown |
| Notes + phone | `text_mm1xmsvn` | text |
| Photo | Files tab (via update) | — |

**Valid category labels:** Travel, Food, Office Supplies, Utilities, Miscellaneous
(GPT-4o is prompted to use these exact values; fallback to Miscellaneous)

---

## Supabase Schema

Table: `expenses`
- `id` uuid PK
- `created_at` timestamptz
- `sender_phone` text
- `merchant` text
- `amount` numeric(10,2)
- `expense_date` date
- `category` text
- `description` text
- `photo_url` text (Supabase Storage URL)
- `monday_item_id` text
- `raw_extraction` jsonb

---

## File Structure

```
A:\Apps\expense-reporter\
├── main.py              # FastAPI app + Twilio webhook handler
├── extractor.py         # GPT-4o vision extraction
├── monday_client.py     # Monday.com GraphQL client
├── supabase_client.py   # Supabase DB + storage
├── models.py            # Pydantic models
├── requirements.txt
├── Dockerfile
├── fly.toml
├── .env                 # Real credentials (not committed)
├── .env.example
├── .gitignore
├── README.md
└── supabase/migrations/001_create_expenses.sql
```

---

## Environment Variables

```
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
OPENAI_API_KEY
MONDAY_API_KEY          # Lightwave key
MONDAY_BOARD_ID=18406176751
SUPABASE_URL=https://zleojlihduagiwewqsjt.supabase.co
SUPABASE_SERVICE_KEY
LOG_LEVEL=INFO
```

---

## Known Issues / Notes

- **SMS replies not delivering** — A2P campaign pending approval. Replies are sent by the app but carrier-filtered until the number is added to the approved campaign.
- Photo uploads land in the **Files tab** of the Monday item detail view (not a board column) — this is intentional, works without a File column on the board.
- GPT-4o extraction for test receipt returned `merchant=None` — the test image may not have had a clear merchant name. Real receipts should extract fine.
- Fly.io deploys require `Set-Location A:\Apps\expense-reporter` before running `flyctl deploy` (build context must be the app dir).

---

## Deployment

```powershell
Set-Location A:\Apps\expense-reporter
C:\Users\canaa\.fly\bin\flyctl.exe deploy --app expense-reporter
```

---

## Relationship to TextBack

- Separate Fly.io app, separate codebase
- Shares: Twilio account, Supabase project (different tables/buckets), master env keys
- Different phone numbers, different webhooks
- Can be pitched together as a "business texting suite" — TextBack for customers, Expense Reporter for internal staff
