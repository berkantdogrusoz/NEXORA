import OpenAI from "openai";
import {
    GenerationMode,
    getDefaultStylePresetId,
    getStylePresetById,
} from "@/lib/style-presets";

type PromptEnhancementOptions = {
    mode: GenerationMode;
    userPrompt?: string;
    stylePresetId?: string;
    modelId?: string;
    intensity?: number;
    customDirection?: string;
    enhancePrompt?: boolean;
    cameraMovement?: string;
    genre?: string;
    motionIntensity?: number;
};

type PromptEnhancementResult = {
    enhancedPrompt: string;
    usedPresetId: string;
    usedEnhancer: boolean;
};

const FALLBACK_BASE_PROMPT: Record<GenerationMode, string> = {
    video: "A breathtaking cinematic sequence captured on ARRI Alexa Mini LF, photorealistic textures, natural volumetric lighting, with precise temporal flow and authentic motion dynamics",
    director: "A masterfully directed cinematic scene with professional camera choreography, atmospheric depth, naturalistic performances, and layered visual storytelling",
    image: "A stunning high-resolution photograph with masterful composition, rich tonal depth, precise color grading, and museum-quality visual fidelity",
};

const CAMERA_MOVEMENTS: Record<string, string> = {
    "dolly-in": "Smooth dolly push-in toward the subject, gradually tightening the frame to build tension and draw focus",
    "dolly-out": "Controlled dolly pull-out revealing the wider environment and establishing spatial context",
    "crane-up": "Sweeping vertical crane rise ascending from ground level to an elevated vantage point",
    "crane-down": "Graceful crane descent from an elevated position down to subject level",
    "orbit-left": "Fluid 180-degree orbital arc moving counter-clockwise around the subject maintaining constant distance",
    "orbit-right": "Fluid 180-degree orbital arc moving clockwise around the subject maintaining constant distance",
    "pan-left": "Steady horizontal pan sweeping left across the scene on a fixed tripod axis",
    "pan-right": "Steady horizontal pan sweeping right across the scene on a fixed tripod axis",
    "tilt-up": "Controlled vertical tilt upward from ground to sky revealing vertical scale",
    "tilt-down": "Controlled vertical tilt downward from sky to ground anchoring the viewer",
    "tracking": "Dynamic lateral tracking shot following the subject in parallel motion",
    "steadicam": "Fluid Steadicam walk-and-talk following the subject through the environment with organic micro-movements",
    "handheld": "Intentional handheld camera with subtle organic shake adding documentary-style urgency and intimacy",
    "static": "Locked-off static tripod shot with zero camera movement for maximum compositional precision",
    "zoom-in": "Smooth optical zoom compressing perspective and isolating the subject within the frame",
    "aerial": "Sweeping aerial drone shot providing a God's-eye cinematic perspective with smooth altitude transitions",
    "fixed": "Camera remains completely fixed and stable with no movement whatsoever",
};

function clampIntensity(value?: number): number {
    if (typeof value !== "number" || Number.isNaN(value)) return 70;
    return Math.max(0, Math.min(100, value));
}

function containsStylizedIntent(text: string): boolean {
    const lowered = text.toLowerCase();
    const stylizedKeywords = [
        "anime", "animation", "cartoon", "3d", "illustration", "stylized",
        "pixel art", "watercolor", "oil painting", "sketch", "cel-shaded",
        "ukiyo-e", "art nouveau", "pop art", "vaporwave", "synthwave",
        "low poly", "claymation", "stop motion", "comic book", "manga",
    ];
    return stylizedKeywords.some((keyword) => lowered.includes(keyword));
}

function getCameraDescription(movement: string): string {
    if (!movement || movement === "auto" || movement === "none") return "";
    return CAMERA_MOVEMENTS[movement] || `Camera: ${movement}`;
}

function buildFallbackPrompt(options: PromptEnhancementOptions): PromptEnhancementResult {
    const {
        mode,
        userPrompt,
        stylePresetId,
        intensity,
        customDirection,
        cameraMovement,
        genre,
        motionIntensity,
        enhancePrompt,
    } = options;

    const resolvedPresetId = stylePresetId || getDefaultStylePresetId(mode);
    const preset = getStylePresetById(resolvedPresetId);
    const basePrompt = (userPrompt || "").trim() || FALLBACK_BASE_PROMPT[mode];
    const isStylized = containsStylizedIntent(basePrompt) || resolvedPresetId === "anime-opening";
    const intensityValue = clampIntensity(intensity);

    const cameraDesc = getCameraDescription(cameraMovement || "");
    const cameraChunk = cameraDesc ? cameraDesc + "." : "";

    const genreChunk = genre && genre !== "cinematic" ? `Genre tone: ${genre}.` : "";

    const motionChunk = typeof motionIntensity === "number"
        ? `Motion dynamics at ${Math.round(motionIntensity * 100)}% energy — ${motionIntensity > 0.7 ? "fast-paced kinetic action" : motionIntensity > 0.4 ? "moderate fluid movement" : "slow contemplative drift"}.`
        : "";

    const directionChunk = customDirection?.trim() ? `Direction: ${customDirection.trim()}.` : "";

    const realismChunk = isStylized
        ? "Maintain intentional stylization with maximum coherence, rich detail, and consistent art direction throughout."
        : "Strict photorealism — real-world textures, natural subsurface scattering, atmospheric haze, physically accurate lighting, zero CGI artifacts.";

    const enhancementChunk = enhancePrompt === false
        ? ""
        : `Cinematic intensity: ${intensityValue}/100. ${intensityValue > 70 ? "Push visual richness, atmospheric density, and lens language to maximum." : "Balance naturalism with cinematic polish."}`;

    const prompt = [
        basePrompt,
        preset?.directives,
        realismChunk,
        cameraChunk,
        genreChunk,
        motionChunk,
        enhancementChunk,
        directionChunk,
    ]
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

    return {
        enhancedPrompt: prompt,
        usedPresetId: resolvedPresetId,
        usedEnhancer: false,
    };
}

export async function buildEnhancedPrompt(options: PromptEnhancementOptions): Promise<PromptEnhancementResult> {
    const fallback = buildFallbackPrompt(options);

    if (options.enhancePrompt === false) {
        return fallback;
    }

    if (!process.env.OPENAI_API_KEY) {
        return fallback;
    }

    const preset = getStylePresetById(fallback.usedPresetId);
    const basePrompt = (options.userPrompt || "").trim() || FALLBACK_BASE_PROMPT[options.mode];
    const isStylized = containsStylizedIntent(basePrompt) || fallback.usedPresetId === "anime-opening";
    const intensityValue = clampIntensity(options.intensity);
    const promptMode = options.mode === "image" ? "image" : "video";
    const cameraDesc = getCameraDescription(options.cameraMovement || "");

    const systemPrompt = `You are an elite ${promptMode} prompt architect specializing in cinematic AI generation. Your prompts consistently produce award-winning visual quality.

Transform the user's idea into ONE production-ready English prompt. Output ONLY the final prompt text — no markdown, no quotes, no labels, no explanation.

ABSOLUTE RULES:
1. PRESERVE the user's core subject, action, and narrative intent exactly.
2. NEVER add subjects, characters, or story elements the user didn't mention.
3. Output must be in English only regardless of input language.

COMPOSITION & FRAMING:
- Specify shot type (extreme close-up, medium close-up, wide establishing, over-the-shoulder, low angle, bird's eye)
- Define depth of field (shallow bokeh f/1.4, deep focus f/11, rack focus between planes)
- Establish foreground/midground/background layers for visual depth
- Use rule of thirds, leading lines, or symmetrical framing when appropriate

LIGHTING & ATMOSPHERE:
- Define primary light source (golden hour rim light, overcast diffusion, neon practicals, moonlight)
- Specify light quality (hard specular highlights, soft diffused wrapping light, dappled through foliage)
- Include atmospheric elements (volumetric god rays, morning mist, heat shimmer, dust motes in light shafts)
- Color temperature and mood (warm amber 3200K, cool blue 5600K, mixed color contrast)

TEXTURE & MATERIAL:
- Reference real-world surface qualities (weathered concrete, wet cobblestone reflections, brushed metal)
- Include micro-detail cues (skin pores, fabric weave, water droplet refraction, rust patina)
- Specify material interactions with light (subsurface scattering on skin, caustics through glass)

${promptMode === "video" ? `MOTION & TEMPORAL FLOW:
- Define movement quality (fluid, staccato, languid, explosive, decelerating)
- Specify temporal pacing (slow-motion 120fps, real-time, time-lapse compression)
- Include environmental motion (wind through hair/fabric, water flow, particle drift, smoke curl)
- Describe action beats and transitions within the clip
- Reference motion intensity and energy level

CAMERA LANGUAGE:
- Describe camera movement precisely (dolly, crane, Steadicam, handheld shake, locked-off static)
- Include movement motivation (camera follows subject, reveals environment, builds tension)
- Specify movement speed and acceleration (slow creep, rapid whip-pan, gentle float)` : ""}

${isStylized
    ? "STYLE: The user intends a stylized aesthetic. Preserve and enhance the specific art style while maximizing visual coherence, detail density, and production quality within that style."
    : "REALISM: Enforce strict photorealism. Reference real-world physics, natural material behavior, atmospheric scattering. Zero CGI artifacts, no uncanny valley, no plastic textures. Think ARRI camera footage, not rendered CGI."}

Enhancement intensity: ${intensityValue}/100. ${intensityValue > 80 ? "Maximum cinematic richness — push every visual dimension to its peak." : intensityValue > 50 ? "Strong enhancement — add significant atmospheric and technical detail." : "Subtle enhancement — preserve simplicity while improving technical quality."}

Output 2-5 dense sentences. Every word must earn its place — no filler, no generic descriptors. Be specific and evocative.`;

    const userInstruction = [
        `User prompt: ${basePrompt}`,
        preset?.name ? `Style preset: ${preset.name}` : "",
        preset?.directives ? `Preset directives: ${preset.directives}` : "",
        cameraDesc ? `Camera movement: ${cameraDesc}` : "",
        options.genre && options.genre !== "cinematic" ? `Genre: ${options.genre}` : "",
        typeof options.motionIntensity === "number" ? `Motion intensity: ${Math.round(options.motionIntensity * 100)}%` : "",
        options.customDirection?.trim() ? `Additional direction: ${options.customDirection.trim()}` : "",
    ].filter(Boolean).join("\n");

    try {
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const completion = await client.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0.72,
            max_tokens: 450,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userInstruction },
            ],
        });

        const text = completion.choices[0]?.message?.content?.trim();
        if (!text) return fallback;

        return {
            enhancedPrompt: text,
            usedPresetId: fallback.usedPresetId,
            usedEnhancer: true,
        };
    } catch (error) {
        console.error("Prompt enhancer fallback triggered:", error);
        return fallback;
    }
}
