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
    video: "A high-quality cinematic sequence with realistic motion and natural detail",
    director: "A cinematic director-style scene with precise camera language and realistic atmosphere",
    image: "A high-quality visual composition with rich detail and strong art direction",
};

function clampIntensity(value?: number): number {
    if (typeof value !== "number" || Number.isNaN(value)) return 70;
    return Math.max(0, Math.min(100, value));
}

function containsStylizedIntent(text: string): boolean {
    const lowered = text.toLowerCase();
    const stylizedKeywords = ["anime", "animation", "cartoon", "3d", "illustration", "stylized", "pixel art"];
    return stylizedKeywords.some((keyword) => lowered.includes(keyword));
}

function buildFallbackPrompt(options: PromptEnhancementOptions): PromptEnhancementResult {
    const {
        mode,
        userPrompt,
        stylePresetId,
        modelId,
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
    const cameraChunk = cameraMovement && cameraMovement !== "auto" ? `Camera movement: ${cameraMovement}.` : "";
    const genreChunk = genre && genre !== "cinematic" ? `Genre tone: ${genre}.` : "";
    const motionChunk = typeof motionIntensity === "number" ? `Motion intensity: ${Math.round(motionIntensity * 100)}%.` : "";
    const directionChunk = customDirection?.trim() ? `Additional direction: ${customDirection.trim()}.` : "";
    const realismChunk = isStylized
        ? "Keep visual style intentionally stylized while maintaining coherence and high detail."
        : "Use strict photorealism, no CGI look, real-world textures, realistic lighting, and believable physics.";

    const enhancementChunk = enhancePrompt === false
        ? "Keep structure concise and close to user intent."
        : `Enhancement intensity: ${intensityValue}/100. Expand scene richness, atmosphere, lens language, and action detail proportionally.`;

    const providerChunk = modelId ? `Target model: ${modelId}.` : "";

    const prompt = [
        basePrompt,
        preset?.directives,
        realismChunk,
        enhancementChunk,
        cameraChunk,
        genreChunk,
        motionChunk,
        directionChunk,
        providerChunk,
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

    const systemPrompt = `You are an expert AI ${promptMode} prompt engineer.
Rewrite the user idea into ONE production-ready English prompt.

RULES:
1) Return only the final prompt text. No markdown, no quotes, no labels.
2) Keep the user's core intent, subject, and action intact.
3) Inject professional detail: composition, atmosphere, texture, lighting, camera language, motion behavior, and realism cues.
4) ${isStylized ? "If stylized intent exists (anime/cartoon/illustration), preserve stylization while maximizing quality and consistency." : "Enforce photorealism unless user explicitly asks stylized aesthetics. Use real-world physics, natural lighting, no CGI/cartoon feel."}
5) Make output provider-friendly and concise but rich (roughly 1-4 sentences).
6) Output must be in English only.
7) Enhancement intensity level: ${intensityValue}/100.`;

    const userInstruction = [
        `User prompt: ${basePrompt}`,
        `Style preset: ${preset?.name || fallback.usedPresetId}`,
        `Preset directives: ${preset?.directives || "None"}`,
        options.modelId ? `Target model: ${options.modelId}` : "",
        options.cameraMovement && options.cameraMovement !== "auto" ? `Camera movement: ${options.cameraMovement}` : "",
        options.genre && options.genre !== "cinematic" ? `Genre: ${options.genre}` : "",
        typeof options.motionIntensity === "number" ? `Motion intensity: ${Math.round(options.motionIntensity * 100)}%` : "",
        options.customDirection?.trim() ? `Additional direction: ${options.customDirection.trim()}` : "",
    ].filter(Boolean).join("\n");

    try {
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const completion = await client.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0.6,
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
