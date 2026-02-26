import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
    "/",
    "/pricing(.*)",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/webhooks(.*)",
    "/privacy(.*)",
    "/terms(.*)",
]);

const hasClerkKeys =
    !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    !!process.env.CLERK_SECRET_KEY;

// When Clerk keys are missing (build-time or missing env), skip auth entirely
function noopMiddleware(_req: NextRequest) {
    return NextResponse.next();
}

const clerkHandler = hasClerkKeys
    ? clerkMiddleware(async (auth, req) => {
        if (!isPublicRoute(req)) {
            await auth.protect();
        }
    })
    : noopMiddleware;

export default clerkHandler;

export const config = {
    matcher: [
        // Skip Next.js internals and static files
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};
