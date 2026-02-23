# NEXORA — AI Creative Studio

## 🎯 Vision
Nexora is a **Prototipal-style AI Creative Studio** — a SaaS platform where users generate videos, images, and social media content using AI, then auto-publish them to Instagram. Think of it as **Canva + Sora + Buffer** combined into one dark, premium, professional tool.

## 🎨 Design Philosophy
- **Dark Mode Only** — Pure black (#000) background, glass-morphism cards, violet/pink accent colors
- **Prototipal-inspired UI** — Sidebar navigation for the app, clean top navbar for marketing pages
- **Premium Feel** — Subtle animations, gradient borders, neon glow effects, backdrop blur
- **Minimalist** — Clean typography, explicitly stating costs and models dynamically.

## 🏗️ Architecture
- **Framework**: Next.js 14 (App Router)
- **Auth**: Clerk
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (for generated images/videos)
- **Styling**: Tailwind CSS + Custom CSS (dark theme)
- **Payments**: Lemon Squeezy (Webhooks integrated)
- **Deployment**: Vercel

## ✨ Core Features (Built & Working)

### 1. AI Video Studio (`/studio`) ✅
- **Dynamic Dropdown Models**: 
  - Standard: DAMO (5 credits), Zeroscope V2 HD (8 credits), Minimax Video-01 (12.5 credits)
  - Premium: Luma Dream Machine Ray (25 credits)
- **Instant Credit Tracking**: UI deducts credits immediately, backend verifies, refunds on failure.
- Controls for aspect ratio, quality, and duration.
- "Send to Calendar" to schedule posting.

### 2. AI Image Generation (`/generate`) ✅
- **Multi-Model Support**: 
  - Standard: DALL-E 2 (5 credits), FLUX Schnell (8 credits)
  - Premium: DALL-E 3 (15 credits), FLUX 1.1 Pro (20 credits)
- Style presets (Photographic, Cinematic, Illustration, etc.)
- Strict UI and Backend validation preventing Free users from accessing Premium.

### 3. AI Marketing Assistant (`/assistant`) ✅
- Chat-based AI that acts as a professional marketing agency.
- **Model Options**: GPT-4o Mini (0.5 credits), GPT-4o (2.0 credits, Premium), Gemini 1.5 Pro (2.0 credits, Premium).
- Aware of user's saved brand tone/settings.

### 4. Content Calendar & Integration (`/calendar`, `/store`) 🚧
- Calendar UI is built, tracking Draft → Approved → Posted.
- "Send to Calendar" features are wired.
- Instagram Graph API connection is set up and working via OAuth.
- **Pending**: Auto-posting logic to directly push Calendar items to Instagram.

### 5. Monetization & Global Credit Engine ✅
- Strict global React context (`useCredits`) combined with highly secure Supabase Backend validations.
- Initializing Free users with 15 credits.
- Lemon Squeezy Webhook fully implemented to automatically renew credits (Growth: 200, Pro: 1000) upon successful monthly payment.

## 💰 Monetization Tiers

| Plan | Price | Credits/Month | Features |
|------|-------|---------------|----------|
| Free | $0 | 15 (One-time) | Standard Video/Image models, GPT-4o-Mini |
| Growth | $29/mo | 200 | All Models, Priority Queues, DALL-E 3, Auto-Post |
| Pro | $59/mo | 1000 | Unlimited Scale, Multi-Brand, Agency Use |

## 🔑 Environment Variables Included
- Clerk (Auth)
- OpenAI (GPT & DALL-E)
- Replicate (Video & FLUX)
- Google Gemini (Assistant)
- Supabase (DB/Storage)
- Instagram Graph API
- Lemon Squeezy (Payments & Webhooks)

## 🔜 What's Next (Pending Tasks)
1. **Instagram Auto-Posting**: Actually firing the final POST request to Instagram Graph API from the Calendar queue.
2. **Dashboard Analytics**: Expanding the `/dashboard` to show beautiful graphical charts using `recharts` for credits used, posts scheduled, and AI tokens consumed.
3. **Autopilot Generator**: Creating the feature where a user clicks one button, and the AI schedules an entire 7-day content calendar based on their brand voice automatically.
