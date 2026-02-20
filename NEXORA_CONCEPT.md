# NEXORA — AI Creative Studio

## 🎯 Vision
Nexora is a **Prototipal-style AI Creative Studio** — a SaaS platform where users generate videos, images, and social media content using AI, then auto-publish them to Instagram. Think of it as **Canva + Sora + Buffer** combined into one dark, premium, professional tool.

## 🎨 Design Philosophy
- **Dark Mode Only** — Pure black (#000) background, glass-morphism cards, violet/pink accent colors
- **Prototipal-inspired UI** — Sidebar navigation for the app, clean top navbar for marketing pages
- **Premium Feel** — Subtle animations, gradient borders, neon glow effects, backdrop blur
- **Minimalist** — No clutter. Every element has a purpose.

## 🏗️ Architecture
- **Framework**: Next.js 14 (App Router)
- **Auth**: Clerk
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (for generated images/videos)
- **Styling**: Tailwind CSS + Custom CSS (dark theme)
- **Deployment**: Vercel

### Route Groups
| Group | Purpose | Navigation |
|-------|---------|-----------|
| `(site)` | Marketing pages (Landing, Pricing, Privacy, Terms, Auth) | Top Navbar |
| `(app)` | Application pages (Studio, Calendar, Dashboard, etc.) | Left Sidebar |

## ✨ Core Features

### 1. AI Video Studio (`/studio`)
- **Text-to-Video**: User enters a prompt → AI generates a video (Replicate API / Stable Video Diffusion)
- Model selection, aspect ratio (16:9, 9:16, 1:1), HD toggle, duration (4s/8s)
- Generated video gallery on the left panel
- "Send to Calendar" to schedule posting
- **Credit Cost**: Each generation costs credits

### 2. AI Image Generation (`/generate`)
- **Text-to-Image**: DALL-E 3 powered image generation
- Style presets (Photographic, Cinematic, Illustration, etc.)
- Size options (1024x1024, 1792x1024, 1024x1792)
- Download or send to Calendar

### 3. Content Calendar (`/calendar`)
- Weekly grid view showing all scheduled posts
- Generate a full week of AI content with one click (Autopilot)
- Approve, edit, regenerate, or upload custom images
- "Post Now" button to instantly publish to Instagram
- Status tracking: Draft → Approved → Posted

### 4. AI Marketing Assistant (`/assistant`)
- Chat-based AI that acts as a professional marketing agency
- Quick action buttons for common tasks
- Brand-aware responses based on user's brand settings

### 5. Dashboard (`/dashboard`)
- Usage stats (posts this week, approved, posted)
- Credit usage meter
- Quick action links
- Weekly streak tracker
- Recent activity feed
- "Connect Instagram" banner if not connected

### 6. Autopilot / Settings (`/autopilot`)
- Brand configuration (name, niche, tone, target audience)
- Instagram connection management
- One-click content generation for the entire week

### 7. Instagram Integration (`/store`)
- OAuth connection to Instagram Business accounts
- Auto-posting via Instagram Graph API
- Image + Video upload support

## 💰 Monetization — Credit System
| Plan | Price | Credits/Month | Features |
|------|-------|---------------|----------|
| Free | $0 | 50 | 3 posts/week, basic AI |
| Pro | $19/mo | 500 | Unlimited posts, HD video, priority |
| Business | $49/mo | 2000 | Team access, API access, analytics |

**Credit Costs:**
- Video generation: 12.5 credits
- Image generation: 5 credits
- AI chat message: 1 credit
- Autopilot (7 posts): 50 credits

## 🔗 API Integrations
| Service | Purpose | Status |
|---------|---------|--------|
| OpenAI (GPT-4) | Content generation, chat assistant | ✅ Active |
| OpenAI (DALL-E 3) | Image generation | ✅ Active |
| Replicate | Video generation (Stable Video Diffusion) | ✅ Active |
| Supabase | Database + Storage | ✅ Active |
| Clerk | Authentication | ✅ Active |
| Instagram Graph API | Auto-posting | ✅ Active |
| Lemon Squeezy / Stripe | Payments | 🔜 Pending |

## 🔑 Environment Variables Required
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
OPENAI_API_KEY=
REPLICATE_API_TOKEN=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
INSTAGRAM_APP_ID=
INSTAGRAM_APP_SECRET=
NEXT_PUBLIC_APP_URL=
```

## 📱 Target Audience
- Solo content creators
- Small business owners
- Social media managers
- Marketing agencies

## 🎯 Competitors / Inspiration
- **Prototipal** (UI/UX inspiration — dark theme, AI tools)
- **Buffer / Later** (scheduling)
- **Canva** (design tools)
- **Runway ML** (AI video)
