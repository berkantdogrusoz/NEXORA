import { NextResponse } from "next/server";

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

        // Get the content type, default to mp4 if not provided
        const contentType = response.headers.get("content-type") || "video/mp4";

        return new NextResponse(blob, {
            headers: {
                "Content-Type": contentType,
                // Force attachment download instead of inline display
                "Content-Disposition": `attachment; filename="nexora-video-${Date.now()}.mp4"`,
            },
        });
    } catch (error: any) {
        console.error("Download proxy error:", error);
        return new NextResponse(`Download failed: ${error.message}`, { status: 500 });
    }
}
