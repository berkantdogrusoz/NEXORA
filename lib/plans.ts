export const PLAN_MAX_CREDITS: Record<string, number> = {
    Free: 100,
    Standard: 500,
    Growth: 1500,
    Pro: 5000,
};

export const STANDARD_DAILY_GENERATION_LIMIT = 6;

export function getPlanMaxCredits(planName: string): number {
    return PLAN_MAX_CREDITS[planName] ?? PLAN_MAX_CREDITS.Free;
}

export function hasProModelAccess(planName: string): boolean {
    return planName === "Growth" || planName === "Pro";
}

export function hasDirectorAccess(planName: string): boolean {
    // All users can access Director Studio (Blueprints)
    return true;
}
