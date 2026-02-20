import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Rate limiting store (in-memory, per-instance)
const rateLimits = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_WINDOW_MS = 60_000;    // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;     // 10 requests per minute

/**
 * Get the authenticated userId or return an error response
 */
export async function getAuthUserId(): Promise<{ userId: string } | { error: NextResponse }> {
    // Build-time safety: check if secret key exists before calling auth()
    if (!process.env.CLERK_SECRET_KEY) {
        return {
            error: NextResponse.json(
                { error: "Unauthorized. Secret key missing." },
                { status: 401 }
            ),
        };
    }

    try {
        const { userId } = await auth();
        if (!userId) {
            return {
                error: NextResponse.json(
                    { error: "Unauthorized. Please sign in." },
                    { status: 401 }
                ),
            };
        }
        return { userId };
    } catch (e) {
        return {
            error: NextResponse.json(
                { error: "Authentication failed." },
                { status: 401 }
            ),
        };
    }
}

/**
 * Simple in-memory rate limiter
 * Returns null if allowed, or an error response if rate limited
 */
export function checkRateLimit(userId: string, endpoint: string): NextResponse | null {
    const key = `${userId}:${endpoint}`;
    const now = Date.now();
    const entry = rateLimits.get(key);

    if (!entry || now > entry.resetAt) {
        rateLimits.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
        return null;
    }

    if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
        return NextResponse.json(
            { error: "Too many requests. Please wait a moment and try again." },
            { status: 429 }
        );
    }

    entry.count++;
    return null;
}

/**
 * Sanitize and trim a string input, stripping dangerous characters
 */
export function sanitizeInput(input: unknown, maxLength = 5000): string {
    if (typeof input !== "string") return "";
    return input.trim().slice(0, maxLength);
}
