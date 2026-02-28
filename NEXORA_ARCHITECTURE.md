# 🏗️ NEXORA AI - System Architecture Blueprint

> **Notice to AI Assistants & Developers:** This document is the definitive master plan of the Nexora AI project. It outlines the tech stack, monetization infrastructure, AI model integrations, and structural rules. **Do not modify the working systems described here without explicit instructions.**

---

## 1. High-Level Overview
**Nexora AI** is a premium, dark-mode-first AI Creative Studio SaaS. It allows users to generate cinematic videos, photorealistic images, and marketing content using top-tier AI models, all within a unified, seamless platform.

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS, Framer Motion
- **Backend:** Next.js Route Handlers (`/app/api/...`), Supabase Edge Functions concept
- **Database & Auth:** Supabase (PostgreSQL), Clerk (Authentication)
- **Billing & Subscriptions:** Lemon Squeezy (Webhooks)
- **Hosting:** Vercel

---

## 2. Core Modules & Integrations

### 🟢 Authentication (Clerk)
- **Strategy:** All users must sign in via Clerk to access the platform's core generator tools (`/studio`, `/generate`, `/director`, `/assistant`).
- **Free Tier Logic:** New sign-ups receive a starter credit balance (e.g., 15 credits) upon first login via the Supabase database triggers/logic (`getAuthUserId()` helper checks database existence).

### 🟢 Database (Supabase)
- **`user_credits` table:** Stores the real-time credit balance. **Golden Rule:** Deductions must happen via API constraints, and UI optimistically updates using React Context (`useCredits`).
- **`user_subscriptions` table:** Synced via Lemon Squeezy Webhooks. Tracks `plan_name`, `status`, `renews_at`.
- **`generations` / `history` tables:** Logs every prompt, output URL, and cost for the user's dashboard and profile history.

### 🟢 Payment Infrastructure (Lemon Squeezy)
- **Webhook Endpoint:** `/api/webhooks/lemon`
- **Plans:**
  - **Free:** Default state. Locked out of Pro models.
  - **Growth ($29/mo):** 200 credits monthly replenishment.
  - **Pro/Premium ($59/mo):** 1000 credits monthly replenishment. Unlocks Pro models (Director Studio, Seedance, Runway).
- **Checkout Route:** `/api/lemon/checkout` dynamically generates unique checkout URLs linking the transaction to the user's Clerk ID.

---

## 3. AI Model Engine & APIs

Nexora aggregates multiple AI APIs into a single interface. The primary orchestrators are `fal.ai` and `replicate`.

### 🎬 Video Models (`/api/video/generate`)
- **Wan-2.1 Turbo** (fal.ai) - Standard (8 credits)
- **Kling 3.0** (fal.ai) - Standard (15 credits)
- **Luma Ray 2** (fal.ai) - Premium (25 credits)
- **Runway Gen-4.5 & GWM-1** (fal.ai) - Premium (35-45 credits)
- **Seedance 2.0 Cinematic** (fal.ai) - Premium (50 credits) 
  *(Supports dynamic `duration: 10` for longer outputs)*

### 📸 Image Models (`/api/image/generate`)
- **DALL-E 2 / FLUX Schnell** (Replicate/OpenAI) - Standard (5-8 credits)
- **DALL-E 3** (OpenAI) - Premium (15 credits)
- **Nano Banana 2** (fal.ai) - Premium (15 credits)

### 🎥 Director Studio (`/api/video/director`) **[PREMIUM ONLY]**
- **Higgsfield AI REST API:** (`POST /v1/generations`)
- Focuses on **Soul Mode** (Character Consistency via facial anchor images) and advanced camera motions (Pan, Zoom, Tilt).
- Extremely deep, high-cost model (120 credits per generation).
- UI locked behind a `/director` paywall.

### 🤖 Marketing Assistant (`/api/assistant`)
- Uses `gemini-1.5-pro` (by default) to act as a marketing agency.
- **Credit Cost:** 2 credits per message.
- Context-aware UI wrapped in Framer Motion chat bubbles.

---

## 4. UI/UX & Design Philosophy

- **Color Palette:** Pure Black (`bg-black`), Dark Grays (`bg-white/5`), Primary Cyan (`cyan-500`), Glow Effects (`cyan-500/20`).
- **Typography:** `Inter` font, heavy use of tracking and font weights (`font-black` for headers).
- **Prototipal Aesthetics:** Visual cards where the media is dominant. Auto-playing looped MP4s on hover. Glassmorphism navigation.
- **Client Components:** Heavy use of `"use client"` for interactive state, toast notifications (`sonner`), and smooth animations (`framer-motion`).

---

## 5. Security & Constraints

1. **Credit Validation:** Never trust the client. API routes must query Supabase to confirm balance before firing AI requests. If AI request fails, credits **must** be refunded.
2. **Tier Locking:** API routes must check `plan_name`. If a Free user sends a POST request asking for a Premium model (e.g., Seedance or Higgsfield), the server must reject it with a `403 Forbidden`.
3. **Environment Security:** API keys (`FAL_KEY`, `REPLICATE_API_TOKEN`, `OPENAI_API_KEY`, `HIGGSFIELD_API_KEY`, `LEMON_SQUEEZY_WEBHOOK_SECRET`) must never leak to the frontend.

---

## 6. Project Directory Rules
- `app/api/*`: Server-side logic. ALL AI calls happen here.
- `app/(app)/*`: Authenticated user dashboard (Studio, Calendar, Assistant, Director). Wraps in Sidebar.
- `app/(site)/*`: Public landing pages (Home, Pricing, Terms). Wraps in Navbar.
- `app/components/`: Reusable UI elements (`sidebar.tsx`, `navbar.tsx`, `gradient-button.tsx`).
- `public/arts/`: Static high-quality user showcase assets for the landing page.

*End of Document. Refer to this to understand the complex interplay of Nexora AI's architecture.*
