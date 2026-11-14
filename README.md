# OmniPulse AI – Full-Stack AI Customer Experience Platform

> **Theme:** AI for Customer Experience  
> **Tagline:** Autonomous Customer Support Copilot, Predictive Churn Triage, and Executive CX Intelligence.

---

## 1. Problem Statement & Solution

### The CX Crisis in Modern SaaS & Enterprise
Customer Experience (CX) teams face insurmountable hurdles:
- **Fragmented Support Channels & Slow Response Times:** Customers wait hours or days for first responses to repetitive inquiries.
- **Silent & Missed Churn Signals:** High-value accounts experiencing payment disputes, broken webhooks, or onboarding bottlenecks express subtle or critical frustration that goes unnoticed until after they cancel.
- **Agent Burnout & Inconsistent Responses:** Frontline support agents spend 70% of their time manually retyping repetitive answers, looking up internal knowledge articles, and guessing the right tone.
- **Disconnect Between Support Telemetry & Leadership Action:** Business leadership lacks actionable, structured synthesis of recurring product friction points.

### The OmniPulse AI Solution
**OmniPulse AI** solves this end-to-end with an enterprise full-stack AI platform:
1. **Self-Service Instant Resolution Chatbot:** Customers receive real-time answers grounded in company Knowledge Base FAQs and past account history before escalating.
2. **Automated AI Ticket Triage (Gemini 2.5 Flash):** Immediately upon ticket submission, Gemini AI generates structured JSON classification:
   - Sentiment Score (Positive, Neutral, Frustrated, Critical + 0–100 score).
   - Urgency & Churn Risk (Low, Medium, High + 1-sentence root cause explanation).
   - Auto-Category (Billing, Technical Issue, Feature Request, Shipping/Delivery, Account).
   - 2-Line Executive Summary.
   - Empathetic Suggested Reply ready for human agent review.
3. **Agent Copilot Workspace:** Unified inbox sorted by urgency and churn vulnerability with one-click actions:
   - Regenerate draft replies across multiple tones (*Empathetic*, *Concise*, *Formal*, *Apologetic + Offer Discount*).
   - Summarize complex message threads into 2 sentences.
   - 1-click dispatch to the customer.
4. **Actionable CX Insights Dashboard:** Real-time Recharts data visualization (Sentiment Donut, Ticket Volume & Resolution Trends, Category Breakdown, Churn Risk Bar) + a **"Generate Executive AI Report"** button that analyzes the last 20 tickets to produce top recurring product pain points, churn drivers, and 3 leadership recommendations with health scores.

---

## 2. Architecture & Tech Stack

```
                                  OMNIPULSE AI ARCHITECTURE
  
  ┌─────────────────────────────────────────────────────────────────────────────────┐
  │                           React + Vite Frontend (/client)                       │
  │   - Tailwind CSS Dark/Light SaaS UI   - Lucide React Icons                      │
  │   - Recharts Visualizations           - Axios with JWT Interceptor               │
  │   - Customer Portal & AI Chat         - Agent Copilot Inbox & Tone Generator    │
  └───────────────────────────────┬─────────────────────────────────────────────────┘
                                  │  REST API Calls (Bearer JWT)
                                  ▼
  ┌─────────────────────────────────────────────────────────────────────────────────┐
  │                         Node.js + Express Backend (/server)                     │
  │   - Stateless JWT Authentication      - Zod Request Schema Validation           │
  │   - Role-Based Access (Customer/Agent)- Centralized Error Handling              │
  └───────────────────────────────┬─────────────────────────────────────────────────┘
                  ▲               │                                 ▲
                  │ Mongoose      │ Structured JSON Prompts         │
                  ▼               ▼                                 ▼
  ┌─────────────────────────┐  ┌───────────────────────────┐  ┌────────────────────┐
  │   MongoDB / Atlas       │  │    Google Gemini API      │  │ Seed Data Script   │
  │  - User Collection      │  │   (gemini-2.5-flash)      │  │ - 1 Agent          │
  │  - Ticket Collection    │  │ - Ticket Triage & Churn   │  │ - 2 Customers      │
  │  - InsightReport Coll.  │  │ - Tone Rewrite Copilot    │  │ - 12 Rich Tickets  │
  │  - KnowledgeItem Coll.  │  │ - Executive CX Intelligence│  │ - 5 Knowledge FAQs │
  └─────────────────────────┘  └───────────────────────────┘  └────────────────────┘
```

### Strict Tech Stack Adherence:
- **Frontend (`/client`):** React 18, Vite, React Router DOM v6, Tailwind CSS, Lucide React, Axios (with interceptors), Recharts.
- **Backend (`/server`):** Node.js, Express.js, MongoDB (Mongoose ODM), JWT stateless auth, bcryptjs for password hashing, Zod for validation, Google Gemini API (`@google/generative-ai` with `gemini-2.5-flash`).
- **Security Rule:** `GEMINI_API_KEY` is strictly accessed in the backend `.env` file and is never exposed to the frontend.

---

## 3. Monorepo Folder Structure

```
omnipulse-ai/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js               # Axios instance with JWT interceptor
│   │   ├── components/
│   │   │   ├── AIInsightReportModal.jsx # Gemini Executive Brief modal
│   │   │   ├── CategoryBadge.jsx      # Auto-category tags
│   │   │   ├── ChurnBadge.jsx         # Churn risk indicator
│   │   │   ├── Navbar.jsx             # Role navigation & demo switcher
│   │   │   ├── ProtectedRoute.jsx     # Role-based route guard
│   │   │   ├── QuickLoginModal.jsx    # 1-click demo accounts modal
│   │   │   └── SentimentBadge.jsx     # Sentiment & 0-100 score badge
│   │   ├── context/
│   │   │   └── AuthContext.jsx        # JWT auth context
│   │   ├── pages/
│   │   │   ├── AgentInbox.jsx         # Agent Copilot workspace
│   │   │   ├── AnalyticsDashboard.jsx # Recharts CX metrics & Executive AI Report
│   │   │   ├── CustomerPortal.jsx     # Self-serve AI chatbot & ticket submission
│   │   │   ├── LoginPage.jsx          # Login with 1-click credentials
│   │   │   └── RegisterPage.jsx       # Customer / Agent registration
│   │   ├── App.jsx                    # Route mapping
│   │   ├── index.css                  # Tailwind styles
│   │   └── main.jsx                   # Entry point
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── .env.example
├── server/
│   ├── config/
│   │   └── db.js                      # MongoDB connection handler
│   ├── controllers/
│   │   ├── analyticsController.js     # Metrics & Gemini Executive Report
│   │   ├── authController.js          # JWT auth & demo users
│   │   ├── chatController.js          # Live AI chatbot & Knowledge Base
│   │   └── ticketController.js        # Ticket CRUD & Copilot actions
│   ├── middleware/
│   │   ├── auth.js                    # JWT verify & role authorization
│   │   ├── errorHandler.js            # Central error handler
│   │   └── validate.js                # Zod request body validation schemas
│   ├── models/
│   │   ├── InsightReport.js           # CX Intelligence report schema
│   │   ├── KnowledgeItem.js           # FAQs & company policies schema
│   │   ├── Ticket.js                  # Support ticket & AI triage schema
│   │   └── User.js                    # User & role schema
│   ├── routes/
│   │   ├── analyticsRoutes.js
│   │   ├── authRoutes.js
│   │   ├── chatRoutes.js
│   │   └── ticketRoutes.js
│   ├── services/
│   │   └── geminiService.js           # Gemini 2.5 Flash structured AI service
│   ├── utils/
│   │   ├── mockAI.js                  # Resilient fallback AI responses
│   │   └── seedData.js                # Rich demo dataset
│   ├── .env.example
│   ├── package.json
│   ├── seed.js                        # Instant DB seed script
│   └── server.js                      # Express application entry
├── package.json                       # Monorepo runner
└── README.md
```

---

## 4. Local Setup & Execution Instructions

### Prerequisites
- **Node.js:** v18.0.0 or higher
- **MongoDB:** Local MongoDB instance OR free MongoDB Atlas cluster connection string
- **Gemini API Key:** From [Google AI Studio](https://aistudio.google.com/)

### Step 1: Clone and Install Dependencies
Install dependencies for both the root monorepo, server, and client:

```bash
# In the project root
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
cd ..
```

### Step 2: Configure Environment Variables

**Backend (`server/.env`):**
```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/omnipulse
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/omnipulse?retryWrites=true&w=majority

JWT_SECRET=omnipulse_jwt_super_secret_production_key_2025
JWT_EXPIRES_IN=7d

# Google Gemini API (Accessed strictly on backend)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

CLIENT_URL=http://localhost:5173
```

**Frontend (`client/.env`):**
```env
VITE_API_URL=http://localhost:5001/api
```

### Step 3: Run the Database Seed Script
Populate the database with 1 demo agent, 2 demo customers, 5 knowledge base articles, and 12 rich customer tickets with automated sentiment triage:

```bash
cd server
npm run seed
```

### Step 4: Start the Applications
Run both server and client concurrently from the root directory:
```bash
# In project root:
npm run dev

# Or run separately in two terminals:
# Terminal 1:
cd server && npm run dev

# Terminal 2:
cd client && npm run dev
```

The frontend will run at **`http://localhost:5173`** and the backend at **`http://localhost:5001`**.

---

## 5. Instant Demo Credentials & Walkthrough

Click the **"Switch Demo Role"** button in the top navigation bar or log in with:

| Persona | Email | Password | Role & Permissions | Key Test Flow |
| :--- | :--- | :--- | :--- | :--- |
| **Sarah Connor** | `agent@omnipulse.ai` | `password123` | **Support Agent** | Unified Inbox, tone drafts, summarize thread, Executive AI Report |
| **Alex Rivera** | `alex.rivera@techcorp.io` | `password123` | **Customer (Enterprise)** | Double billing ticket, 504 webhook timeouts, SAML SSO lockout |
| **Elena Rostova** | `elena@novaworks.com` | `password123` | **Customer (Growth)** | Shipping hardware status, RBAC role permissions, dark mode request |

---

## 6. Deployment Configuration

### 1. MongoDB Atlas (Database)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and create a free M0 cluster.
2. In **Database Access**, create a user (e.g. `omnipulse-admin`) with read/write privileges.
3. In **Network Access**, add IP `0.0.0.0/0` (Allow Access from Anywhere).
4. Copy the connection string:  
   `mongodb+srv://omnipulse-admin:<password>@cluster0.abcde.mongodb.net/omnipulse?retryWrites=true&w=majority`
5. Set this as `MONGODB_URI` in your backend deployment environment.

### 2. Render / Railway (Backend API)
1. Link your Git repository to **Render** or **Railway**.
2. Select **Web Service** with Root Directory: `server`.
3. Set **Build Command:** `npm install`
4. Set **Start Command:** `npm start`
5. Configure Environment Variables in the provider dashboard:
   - `PORT=5000`
   - `NODE_ENV=production`
   - `MONGODB_URI=<your_atlas_connection_string>`
   - `JWT_SECRET=<strong_random_secret>`
   - `GEMINI_API_KEY=<your_gemini_api_key>`
   - `CLIENT_URL=https://your-omnipulse-client.vercel.app`
6. (Optional) Run the seed script via Render Shell or Railway CLI: `npm run seed`.

### 3. Vercel (Frontend Client)
1. In [Vercel](https://vercel.com/), click **New Project** and import your repository.
2. Set **Root Directory:** `client`.
3. Framework Preset: **Vite**.
4. Set Environment Variable:
   - `VITE_API_URL=https://your-omnipulse-server.onrender.com/api`
5. Click **Deploy**. Vercel will build and deploy the React client with automatic SSL and global CDN.
