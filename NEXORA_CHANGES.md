## Nexora – Change Log (AI Assistant Session)

### 2026-03-02

- Updated landing page (`app/(site)/page.tsx`) copy to position Nexora as a general-purpose AI creative studio for images and video, without narrowing the product to Instagram/TikTok, while keeping the same premium visual design.
- Adjusted top models section on the landing to describe use-cases in neutral language (ads, trailers, campaigns, key visuals) and kept the model grid structure intact.
- Renamed navbar item `Image Gen` to `Image Creatives` and ensured navigation/footers consistently reflect the studio-focused naming.
- Cleaned marketing-heavy wording from the assistant UI and repurposed it as an optional “AI Creative Assistant” for ideas/hooks/captions, without changing any credit or model logic.
- Updated assistant system prompt (`app/api/assistant/route.ts`) from a marketing-agency persona to a neutral creative-studio assistant, tuned for helping users shape prompts and content flows, while keeping existing model/credit checks.
- Refined image and video generator UIs:
  - Added clearer, platform-agnostic labels for aspect ratios in `/studio` and `/generate` (e.g., “16:9 (Wide)”, “9:16 (Vertical)”, “1:1 (Square)”).
  - Left all underlying API and credit behavior unchanged.
- Updated terms copy (`app/(site)/terms/page.tsx`) to describe Nexora as an AI creative tool for videos/images, still documenting Instagram Graph API usage where legally/technically required.
- Surfaced Higgsfield in pricing/communication:
  - Mentioned Higgsfield Director explicitly in the Pro plan feature list and in the “Which AI models are used?” FAQ, matching the existing `/director` implementation.
  - Did not change any Higgsfield API logic or credit cost; only the explanatory text.

