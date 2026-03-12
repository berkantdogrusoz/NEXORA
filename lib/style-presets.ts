export type GenerationMode = "video" | "image" | "director";

export type StylePresetCategory =
    | "cinematic"
    | "ads"
    | "social"
    | "animation"
    | "documentary"
    | "education";

export type StylePreset = {
    id: string;
    name: string;
    description: string;
    category: StylePresetCategory;
    tags: string[];
    directives: string;
    preferredModes: GenerationMode[];
    premium?: boolean;
    image: string;
};

export const STYLE_PRESETS: StylePreset[] = [
    {
        id: "cinema-studio",
        name: "Cinema Studio",
        description: "Photoreal cinematic frames with pro camera grammar",
        category: "cinematic",
        tags: ["cinematic", "realistic", "camera"],
        directives: "Use strict photorealism, dramatic but natural lighting, dynamic camera movement, realistic textures, real-world physics, subtle motion blur, and premium film color grading.",
        preferredModes: ["video", "director", "image"],
        image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400&h=400",
    },
    {
        id: "epic-movie-scenes",
        name: "Epic Movie Scenes",
        description: "Large-scale action moments and dramatic compositions",
        category: "cinematic",
        tags: ["epic", "action", "dramatic"],
        directives: "Compose as a high-budget movie scene with cinematic blocking, deep atmosphere, dynamic camera choreography, realistic impact physics, and high emotional tension.",
        preferredModes: ["video", "director", "image"],
        premium: true,
        image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=400&h=400",
    },
    {
        id: "product-ads",
        name: "Product Ads",
        description: "Commercial-quality ad visuals focused on product detail",
        category: "ads",
        tags: ["ad", "product", "brand"],
        directives: "Style as premium commercial advertising: crisp product focus, clean framing, polished lighting, premium materials, conversion-oriented composition, and brand-safe visuals.",
        preferredModes: ["video", "director", "image"],
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400&h=400",
    },
    {
        id: "luxury-style",
        name: "Luxury Style",
        description: "Elegant premium look for fashion and high-end brands",
        category: "ads",
        tags: ["luxury", "fashion", "premium"],
        directives: "Use elegant luxury visual language: rich textures, premium wardrobe/materials, soft directional light, refined camera movement, and cinematic high-end color tones.",
        preferredModes: ["video", "director", "image"],
        premium: true,
        image: "https://images.unsplash.com/photo-1490481651827-cebc379bc422?auto=format&fit=crop&q=80&w=400&h=400",
    },
    {
        id: "viral-social",
        name: "Viral Social",
        description: "Fast hook-driven style for TikTok and Reels",
        category: "social",
        tags: ["viral", "hook", "tiktok"],
        directives: "Prioritize thumb-stopping visual hook in first seconds, punchy scene transitions, expressive action, high clarity, and social-first composition optimized for mobile attention.",
        preferredModes: ["video", "director", "image"],
        image: "https://images.unsplash.com/photo-1611162616305-c47bbcad655e?auto=format&fit=crop&q=80&w=400&h=400",
    },
    {
        id: "ugc-creator",
        name: "UGC Creator",
        description: "Authentic creator-style content with natural handheld feel",
        category: "social",
        tags: ["ugc", "creator", "authentic"],
        directives: "Style like authentic UGC content: natural expressions, handheld framing, believable environments, practical lighting, and relatable social-media pacing.",
        preferredModes: ["video", "director"],
        image: "https://images.unsplash.com/photo-1516055619834-31dcfe0db479?auto=format&fit=crop&q=80&w=400&h=400",
    },
    {
        id: "street-interview",
        name: "Street Interview",
        description: "Real-world vox-pop style with documentary realism",
        category: "documentary",
        tags: ["street", "interview", "documentary"],
        directives: "Use documentary realism with street-level handheld camera style, natural ambient lighting, authentic subject behavior, and grounded real-world details.",
        preferredModes: ["video", "director", "image"],
        image: "https://images.unsplash.com/photo-1517512061266-07abed11c471?auto=format&fit=crop&q=80&w=400&h=400",
    },
    {
        id: "documentary",
        name: "Documentary",
        description: "Grounded storytelling with natural realism",
        category: "documentary",
        tags: ["doc", "real", "story"],
        directives: "Create a documentary visual tone: observational camera language, realistic pacing, natural lighting, factual atmosphere, and believable environmental context.",
        preferredModes: ["video", "director", "image"],
        image: "https://images.unsplash.com/photo-1478479405421-ce83c92fb3ba?auto=format&fit=crop&q=80&w=400&h=400",
    },
    {
        id: "explainer-clean",
        name: "Explainer Clean",
        description: "Clear, simple and structured visual communication",
        category: "education",
        tags: ["explainer", "clear", "educational"],
        directives: "Emphasize clarity over complexity: clean composition, readable focal points, straightforward storytelling flow, and minimal visual noise.",
        preferredModes: ["video", "image"],
        image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=400&h=400",
    },
    {
        id: "anime-opening",
        name: "Anime Opening",
        description: "Stylized anime energy with expressive motion",
        category: "animation",
        tags: ["anime", "stylized", "opening"],
        directives: "Use anime-inspired stylization: expressive framing, stylized lighting, high-energy action beats, dramatic mood, and strong art-direction consistency.",
        preferredModes: ["video", "image"],
        image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=400&h=400",
    },
    {
        id: "faceless-broll",
        name: "Faceless B-Roll",
        description: "No-face storytelling scenes for business content",
        category: "social",
        tags: ["faceless", "b-roll", "business"],
        directives: "Design faceless storytelling shots focused on hands, objects, environments, screens, and context details with smooth edit-friendly transitions.",
        preferredModes: ["video", "director", "image"],
        image: "https://images.unsplash.com/photo-1497215968146-277dfa81add9?auto=format&fit=crop&q=80&w=400&h=400",
    },
    {
        id: "dramatic-tv-teaser",
        name: "Dramatic TV Teaser",
        description: "Suspenseful trailer tone with tension-heavy framing",
        category: "cinematic",
        tags: ["teaser", "suspense", "drama"],
        directives: "Craft a dramatic teaser style: high-contrast mood, suspenseful pacing, emotionally charged framing, and cinematic dramatic atmosphere.",
        preferredModes: ["video", "director", "image"],
        premium: true,
        image: "https://images.unsplash.com/photo-1440407876336-62333a6f010f?auto=format&fit=crop&q=80&w=400&h=400",
    },
];

export const STYLE_PRESET_CATEGORIES: StylePresetCategory[] = [
    "cinematic",
    "ads",
    "social",
    "animation",
    "documentary",
    "education",
];

export function getStylePresetById(id?: string | null): StylePreset | undefined {
    if (!id) return undefined;
    return STYLE_PRESETS.find((preset) => preset.id === id);
}

export function getStylePresetsForMode(mode: GenerationMode): StylePreset[] {
    return STYLE_PRESETS.filter((preset) => preset.preferredModes.includes(mode));
}

export function getDefaultStylePresetId(mode: GenerationMode): string {
    if (mode === "director") return "cinema-studio";
    if (mode === "image") return "product-ads";
    return "viral-social";
}
