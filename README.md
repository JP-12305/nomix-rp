# NOMIX Roleplay — FiveM Community Platform & Discord Visa Ecosystem

![NOMIX Roleplay](/public/logo/logo.png)

> **"YOUR CITY. YOUR STORY. YOUR LEGACY."**  
> A complete, production-grade FiveM roleplay community platform featuring a cinematic public portal, multi-step visa application wizard, Supabase PostgreSQL database with Row Level Security, private staff review dashboard, and standalone Discord bot with interactive review embeds, modal rejection, and automated citizen role granting.

---

## 🌟 Key Features

### 🌐 1. Public Web Portal (Next.js 14+ App Router)
- **Cinematic Homepage**: Dynamic cyber-urban aesthetic tailored to the official NOMIX visual identity (Dark Obsidian, Electric Cyan, Metallic Chrome, and Subtle Automotive Crimson).
- **Live Server Status Telemetry**: Shows online players, latency, queue, server uptime, direct FiveM connect trigger (`fivem://connect/...`), and IP copier.
- **Database-Driven Rules (`/rules`)**: Live keyword search, severity filtering (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), rule numbers (`01`, `02`), and expandable details.
- **Features Showcase (`/features`)**: Interactive breakdowns of Custom Vehicle Physics 3.0, Economy & Money Laundering, Underground Bank Heists, and Modular Housing.
- **News & Announcements (`/news` & `/news/[slug]`)**: Database-driven patch notes and community dispatches with markdown formatting.
- **FAQ Knowledgebase (`/faq`)**: Animated categorized accordions and 24/7 ticket support callouts.
- **Discord Gateway (`/discord`)**: Live guild stats, member counts, community guidelines, and instant invite links.
- **Faction Directories**: Preview pages for `/departments`, `/staff`, `/media`, and cosmetic `/store`.

### 📝 2. Multi-Step Visa Application System (`/apply`)
- **6-Step Interactive Form**:
  1. **Personal Information** (Auto-linked Discord account, Age, Country, Timezone, FiveM identifier).
  2. **Roleplay Experience** (Hours, past servers, whitelisted positions).
  3. **Character Profile** (First/Last name validation, age, gender, detailed backstory, flaws, goals).
  4. **Roleplay Knowledge** (RDM, VDM, Metagaming, Powergaming, Fail RP).
  5. **Scenario Tests** (High-stakes traffic stop, hostage at gunpoint, roleplaying narrative defeat).
  6. **Rules Agreement** (Mandatory consent checkboxes).
- **Zod & React Hook Form Validation**: Step-by-step schema verification with client & server checks.
- **Fraud & Duplicate Protection**: Blocks duplicate active applications and enforces configurable reapplication cooldowns.
- **Draft Auto-Save**: Preserves form progress in browser storage.

### ⏱️ 3. Live Application Tracker (`/status`)
- Real-time step timeline (`Submitted` $\to$ `Staff Review` $\to$ `Final Decision`).
- Dynamic status states:
  - 🟡 **PENDING**: Application queued for recruitment staff.
  - 🔵 **UNDER REVIEW**: Recruiter is actively evaluating responses.
  - 🟢 **APPROVED**: Congratulations banner, Citizen Discord role confirmation, and direct server connect button.
  - 🔴 **REJECTED**: Staff-provided constructive feedback and cooldown timer.

### 🛡️ 4. Staff & Admin Management Portal (`/admin`)
- **Metrics Overview**: Real-time counters for Pending, Under Review, Approved, Rejected, and Acceptance Rate.
- **Applications Table**: Searchable by Application Number (`APP-XXXXXX`), Character Name, Discord Username, or Discord ID.
- **Detailed Review Interface**:
  - Full view of applicant questionnaire answers.
  - **Private Staff Notes**: Add internal comments (never visible to applicants).
  - **Audit Event Timeline**: Tracks all lifecycle events (`APPLICATION_SUBMITTED`, `STAFF_NOTE_ADDED`, `APPLICATION_APPROVED`, etc.).
  - **Approve Visa**: Automatically assigns Discord Citizen role and updates database.
  - **Reject Visa**: Opens prompt requiring constructive feedback before issuing rejection.

### 🤖 5. Discord Bot Service (`discord-bot/`)
- **Interactive Review Embeds**:
  - `[ 📋 View Application ]`: Opens authenticated staff dashboard link.
  - `[ 🟢 Approve Visa ]`: Validates staff permissions, assigns `DISCORD_VERIFIED_ROLE_ID`, updates Supabase, and posts to `#visa-approved`.
  - `[ 🔴 Reject Visa ]`: Opens a Discord modal requiring staff feedback, updates Supabase, and posts to `#visa-rejected`.
- **Role Hierarchy Validation**: Prevents state desync if the bot's role is below the target Citizen role.
- **Slash Commands**: `/visa-status` for players to check their whitelist status from within Discord.

---

## 🏗️ System Architecture

```
USER
  │
  ▼
NEXT.JS FRONTEND (App Router, Tailwind, Framer Motion)
  │
  ├───► SUPABASE AUTH (Discord OAuth)
  │
  └───► NEXT.JS SERVER ACTIONS / API
          │
          ▼
    SUPABASE POSTGRESQL (Source of Truth with RLS)
          ▲
          │
    DISCORD BOT (Node.js, TypeScript, discord.js v14)
          │
   ┌──────┴───────────────┬────────────────────────┐
   ▼                      ▼                        ▼
#visa-applications     #visa-approved           #visa-rejected
(Interactive Embeds)  (Applicant Notification) (Feedback Embed)
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | Next.js 14+ (App Router, React 18, TypeScript) |
| **Styling** | Tailwind CSS, Custom Design System Tokens, Glassmorphism |
| **Icons & Animation** | Lucide React, Framer Motion |
| **Forms & Validation** | React Hook Form, Zod |
| **Database & Auth** | Supabase (PostgreSQL, Supabase Auth, Row Level Security) |
| **Discord Bot** | Node.js, TypeScript, discord.js v14 |
| **Hosting** | Vercel (Web) + Railway / Render / VPS (Discord Bot) |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js `v18.17+` or `v20+`
- NPM `v9+` or `v10+`
- A Supabase Project ([supabase.com](https://supabase.com))
- A Discord Developer Application ([discord.com/developers](https://discord.com/developers/applications))

---

### Step 1: Clone and Install Dependencies

```bash
# 1. Install root Next.js dependencies
npm install

# 2. Install Discord Bot dependencies
cd discord-bot
npm install
cd ..
```

---

### Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env.local` in the root directory:
```bash
cp .env.example .env.local
```

2. Copy `discord-bot/.env.example` to `discord-bot/.env`:
```bash
cp discord-bot/.env.example discord-bot/.env
```

Fill in your configuration:

#### Root `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret

NEXT_PUBLIC_SERVER_NAME="NOMIX Roleplay"
NEXT_PUBLIC_SERVER_SLOGAN="YOUR CITY. YOUR STORY. YOUR LEGACY."
NEXT_PUBLIC_DISCORD_INVITE_URL="https://discord.gg/zDZNZT2RKq"
NEXT_PUBLIC_FIVEM_CONNECT_URL="fivem://connect/play.nomixrp.com"
NEXT_PUBLIC_SERVER_IP="play.nomixrp.com"

REAPPLICATION_COOLDOWN_DAYS=3
```

#### `discord-bot/.env`:
```env
DISCORD_BOT_TOKEN=your-discord-bot-token
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_GUILD_ID=your-discord-guild-id

DISCORD_APPLICATION_CHANNEL_ID=your-apps-channel-id
DISCORD_APPROVED_CHANNEL_ID=your-approved-channel-id
DISCORD_REJECTED_CHANNEL_ID=your-rejected-channel-id

DISCORD_VERIFIED_ROLE_ID=your-citizen-role-id
DISCORD_STAFF_ROLE_ID=your-staff-role-id
DISCORD_ADMIN_ROLE_ID=your-admin-role-id

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
WEBSITE_URL=http://localhost:3000
```

---

### Step 3: Run Database Migrations in Supabase

1. Open your Supabase Dashboard $\to$ **SQL Editor**.
2. Run the migration script located at [`supabase/migrations/20260919000000_init_schema.sql`](file:///d:/nomix-site/supabase/migrations/20260919000000_init_schema.sql).
3. Run the seed script located at [`supabase/seed.sql`](file:///d:/nomix-site/supabase/seed.sql) to populate initial rules, FAQs, news articles, and application questions.

---

### Step 4: Run the Platform Locally

#### 1. Start Next.js Web Application:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

#### 2. Start Discord Bot:
```bash
cd discord-bot
npm run dev
```

---

## 🤖 Discord Bot Setup Instructions

1. **Create Discord Application**:
   - Go to [Discord Developer Portal](https://discord.com/developers/applications).
   - Click **New Application**, name it `NOMIX Visa Bot`.
2. **Bot Configuration**:
   - Navigate to the **Bot** tab.
   - Enable **Server Members Intent** and **Message Content Intent**.
   - Click **Reset Token** and paste the token into `DISCORD_BOT_TOKEN`.
3. **OAuth2 Redirects**:
   - Under **OAuth2** $\to$ **General**, add your Redirect URL:
     `https://yourdomain.com/api/auth/callback` (or `http://localhost:3000/api/auth/callback` for dev).
4. **Invite Bot to Server**:
   - Under **OAuth2** $\to$ **URL Generator**, select scopes: `bot`, `applications.commands`.
   - Select permissions: `Manage Roles`, `Send Messages`, `Embed Links`, `Read Message History`.
   - Copy the invite URL and add the bot to your Discord server.
5. **Configure Role Hierarchy**:
   > [!IMPORTANT]
   > Ensure the **Bot's highest role** is placed **ABOVE** the `Citizen / Verified` role in Discord Server Settings $\to$ Roles. Discord prevents bots from assigning roles positioned higher than themselves.

---

## 🔐 Security & RLS Policies

- **Row Level Security (RLS)** is enabled across all tables.
- **Applicant Data Isolation**: Normal applicants can only read and insert their own applications and answers.
- **Staff Privacy**: Staff notes are strictly isolated and never returned to applicant queries.
- **Server-Side Verification**: Privileged actions (approving applications, rejecting applications, issuing roles) require staff validation on the backend.
- **Zero Exposed Secrets**: `SUPABASE_SERVICE_ROLE_KEY` and `DISCORD_BOT_TOKEN` are kept strictly server-side.

---

## 🚢 Production Deployment

### 1. Web Application (Vercel)
- Push repository to GitHub.
- Import project into [Vercel](https://vercel.com).
- Set Environment Variables from `.env.example`.
- Deploy!

### 2. Discord Bot (Railway / Render / VPS)
- Deploy the `discord-bot` subdirectory to a persistent host (e.g., Railway, Render Background Worker, or Ubuntu VPS with `pm2`).
- Command: `npm run build && npm run start`.

---

## 📄 License
Copyright © 2026 NOMIX Roleplay. All rights reserved.
