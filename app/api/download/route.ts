import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const url = searchParams.get("url");

        if (!url) {
            return new NextResponse("Missing URL parameter", { status: 400 });
        }

        // Fetch the file from the remote URL
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.statusText}`);
        }

        // Ensure we have a Blob/ArrayBuffer to send down
        const blob = await response.blob();

        // Get the content type and determine file extension
        const contentType = response.headers.get("content-type") || "application/octet-stream";
        let ext = "mp4";
        if (contentType.includes("png")) ext = "png";
        else if (contentType.includes("jpeg") || contentType.includes("jpg")) ext = "jpg";
        else if (contentType.includes("webp")) ext = "webp";
        else if (contentType.includes("gif")) ext = "gif";
        else if (contentType.includes("svg")) ext = "svg";

        return new NextResponse(blob, {
            headers: {
                "Content-Type": contentType,
                // Force attachment download instead of inline display
                "Content-Disposition": `attachment; filename="nexora-${Date.now()}.${ext}"`,
            },
        });
    } catch (error: any) {
        console.error("Download proxy error:", error);
        return new NextResponse(`Download failed: ${error.message}`, { status: 500 });
    }
}
