export const PLAN_MAX_CREDITS: Record<string, number> = {
    Free: 50,
    Standard: 200,
    Growth: 500,
    Pro: 1000,
};

export const STANDARD_DAILY_GENERATION_LIMIT = 6;

export function getPlanMaxCredits(planName: string): number {
    return PLAN_MAX_CREDITS[planName] ?? PLAN_MAX_CREDITS.Free;
}

export function hasProModelAccess(planName: string): boolean {
    return planName === "Growth" || planName === "Pro";
}

export function hasDirectorAccess(planName: string): boolean {
    return planName === "Growth" || planName === "Pro";
}
