/**
 * RapidAPI proxy verification.
 *
 * When a request comes through RapidAPI, it carries a secret header
 * (`X-RapidAPI-Proxy-Secret`) that we compare against our env var.
 * If valid, we skip our own API-key / balance checks because RapidAPI
 * handles billing on their side.
 */

const RAPIDAPI_USER_ID = "rapidapi-proxy";

export function isRapidApiRequest(req: Request): boolean {
    return !!req.headers.get("x-rapidapi-proxy-secret");
}

export function verifyRapidApiRequest(req: Request): {
    valid: boolean;
    userId: string;
    subscription: string;
} {
    const secret = req.headers.get("x-rapidapi-proxy-secret");
    const expectedSecret = process.env.RAPIDAPI_PROXY_SECRET;

    if (!expectedSecret || !secret || secret !== expectedSecret) {
        return { valid: false, userId: "", subscription: "" };
    }

    const rapidUser = req.headers.get("x-rapidapi-user") || "unknown";
    const subscription = req.headers.get("x-rapidapi-subscription") || "free";

    return {
        valid: true,
        userId: `${RAPIDAPI_USER_ID}_${rapidUser}`,
        subscription,
    };
}
