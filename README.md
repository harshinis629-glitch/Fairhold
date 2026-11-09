# Fairhold – AI-Powered Rental Deposit Protection

> **A modern fintech escrow and automated damage adjudication platform for peer-to-peer and studio equipment rentals.**

Fairhold eliminates security deposit disputes between equipment owners and renters through deterministic, objective AI comparative inspection (Google Gemini Vision) coupled with automated escrow execution (PayPal Sandbox REST API authorization, partial capture, and void).

---

## 📸 Core Features

### 1. 🔍 AI Damage Detection (Gemini Vision)
- **Comparative Baseline Inspection:** Compares pristine baseline handover photos (BEFORE) against return condition photos (AFTER).
- **Forensic Anomaly Detection:** Detects new scratches, dents, cracks, abrasions, and structural flaws.
- **Side-by-Side Visual Viewer:** Interactive comparison featuring split sliders, before/after toggle flips, and bounding box damage locators.
- **Detailed Forensic Output:** For each detected anomaly, provides part name, damage type, severity (*Minor*, *Moderate*, *Severe*), confidence percentage (e.g. 94%), estimated restoration cost, and recommended deposit deduction.

### 2. ⚖️ Owner-Approved Settlement & Adjudication
- **Real-Time Financial Calculator:** Calculates rental fees, security deposits, and proposed damage deductions.
- **Owner Review Controls:** Owners can review each anomaly, approve the proposed amount, adjust it with custom rationale, or waive it as normal production wear & tear.
- **Transparent Renter Receipts:** Renters receive an itemized settlement ledger showing exactly how much of their security deposit was captured for repairs and how much was released.
- **Dispute Resolution Channel:** Renters can file a formal dispute with custom statements if they contest a deduction.

### 3. 💳 PayPal Sandbox Escrow Engine
- **Authorization:** Authorizes total rental amount (`Rental Fee + Security Deposit`) upfront via PayPal REST API `POST /v2/checkout/orders` with `intent: "AUTHORIZE"`.
- **Partial Capture:** Upon return and owner review, captures only the `Rental Fee + Approved Damage Deductions` via `POST /v2/payments/authorizations/{auth_id}/capture`.
- **Immediate Void:** Immediately voids the remaining authorized balance via `POST /v2/payments/authorizations/{auth_id}/void`, releasing the remaining deposit back to the renter.
- **No Fake Success:** Directly talks to PayPal Sandbox REST endpoints and surfaces actual PayPal Authorization IDs, Capture IDs, Void IDs, and raw API responses.

---

## 🎨 Fintech Design & Palette
- **Palette:** Premium Indigo (`#4F46E5`) for trust & security, and Emerald (`#059669`) for protected deposits and refunds.
- **Theme:** High-contrast dark fintech UI with responsive cards, live status badges, ambient gradients, and an auditable event timeline.
- **Role Switcher:** Instant toggle between **Owner View** (claim review & adjudication) and **Renter View** (transparent receipts & dispute submission).

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti |
| **Backend** | Python 3.14 / 3.11+, FastAPI, Uvicorn, SQLAlchemy |
| **Database** | SQLite (`fairhold.db`) |
| **AI Vision** | Google Gemini Vision API (`gemini-1.5-flash` / `gemini-2.0-flash`) |
| **Payments** | PayPal Sandbox REST API (`v2/checkout/orders`, `v2/payments/authorizations`) |

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js (v18+) and npm
- Python (v3.10+)

### 1. Backend Setup
```bash
cd backend

# Create virtual environment (if not already created)
python -m venv venv

# Activate virtual environment
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server (runs on http://localhost:8000)
python run.py
```
*Note: The backend automatically seeds 3 ready-to-test rental agreements and generated test proof photos on initial boot.*

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server (runs on http://localhost:5173)
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## ⚙️ Environment Variables & Credentials

Fairhold includes **out-of-the-box demo fallbacks** so you can immediately click through the entire UI, inspect photos, review deductions, and execute simulated settlements even before pasting credentials!

To connect live APIs, configure `backend/.env`:

```env
# Server
PORT=8000
DATABASE_URL=sqlite:///./fairhold.db

# 1. Google Gemini Vision API Key
# Get a key at: https://aistudio.google.com/
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE

# 2. PayPal Sandbox REST API Credentials
# Get sandbox credentials at: https://developer.paypal.com/dashboard/applications/sandbox
PAYPAL_CLIENT_ID=YOUR_PAYPAL_SANDBOX_CLIENT_ID
PAYPAL_CLIENT_SECRET=YOUR_PAYPAL_SANDBOX_CLIENT_SECRET
PAYPAL_MODE=sandbox
```

---

## 🧪 Testing the Flow

1. **Dashboard:** Browse pre-seeded rental contracts (e.g. *Sony FX3 Cinema Camera Kit*, *DJI Mavic 3 Pro Drone*).
2. **AI Inspection:** Click into a contract to view the interactive **Side-by-Side Visual Forensics Viewer**. Toggle between *Side-by-Side*, *Split Slider*, and *Toggle Flip*.
3. **Owner Review:** As an Owner, review the detected scratches and cracks. Click **Approve**, **Adjust ($)**, or **Waive (Wear)** on each item. Observe the settlement ledger recalculate in real-time.
4. **PayPal Settlement:** Click **Finalize & Execute Settlement**. In the PayPal Sandbox modal, confirm the 2-step execution:
   - Step 1: Capture Rental Fee + Approved Damage
   - Step 2: Void Remaining Security Deposit
5. **Auditable Timeline:** Scroll down to see every event timestamped and logged with actor tags (`PAYPAL`, `GEMINI_AI`, `OWNER`, `RENTER`).
6. **Live AI Inspector:** Use the standalone tab in the top navigation to upload any two images from your computer and run instant comparative detection!

---

## 📁 Repository Structure
```
Fairhold/
├── backend/
│   ├── app/
│   │   ├── config.py             # Settings & environment detection
│   │   ├── database.py           # SQLite connection & session
│   │   ├── models.py             # SQLAlchemy models (Rental, Finding, ActivityLog)
│   │   ├── schemas.py            # Pydantic validation schemas
│   │   ├── main.py               # FastAPI application & REST endpoints
│   │   ├── seed_data.py          # Auto-generates test proof photos & seed records
│   │   └── services/
│   │       ├── gemini_service.py # Gemini Vision comparative inspection
│   │       └── paypal_service.py # Real PayPal Sandbox REST API calls (OAuth, Order, Auth, Capture, Void)
│   ├── uploads/                  # Generated demo photos & user uploads
│   ├── requirements.txt          # Python dependencies
│   ├── test_api.py               # Automated 8-step end-to-end test suite
│   ├── run.py                    # Server launch script
│   └── .env.example              # Credentials placeholder template
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx               # Header with role toggle & API status
│   │   │   ├── SideBySideViewer.jsx     # Side-by-side & split slider comparison
│   │   │   ├── DamageCard.jsx           # Anomaly card with severity & owner controls
│   │   │   ├── SettlementBreakdown.jsx  # Deterministic settlement calculation ledger
│   │   │   ├── PayPalPaymentModal.jsx   # 2-step capture & void modal + JSON inspector
│   │   │   ├── ActivityTimeline.jsx     # Auditable lifecycle timeline
│   │   │   ├── QuickStats.jsx           # Fintech escrow KPI metrics
│   │   │   ├── RentalCard.jsx           # Agreement card for dashboard
│   │   │   └── StatusBadge.jsx          # Color-coded status & severity pills
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx            # Main dashboard & contracts list
│   │   │   ├── RentalDetail.jsx         # Full inspection & settlement workflow
│   │   │   ├── NewRental.jsx            # Create agreement & authorize deposit
│   │   │   └── AiInspector.jsx          # Standalone AI damage detection tool
│   │   ├── services/
│   │   │   └── api.js                   # Fetch client for all backend endpoints
│   │   ├── App.jsx                      # Root application & routing
│   │   ├── main.jsx                     # Entry point
│   │   └── index.css                    # Tailwind CSS & animations
│   ├── tailwind.config.js               # Indigo & Emerald fintech theme config
│   ├── postcss.config.js
│   ├── vite.config.js                   # Vite configuration with backend proxy
│   └── package.json
├── .env.example
└── README.md
```
##Author
HARSHINI S
