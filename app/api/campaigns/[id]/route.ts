import { NextResponse } from "next/server";
import { deleteCampaign } from "@/lib/campaigns-store";
import { getAuthUserId } from "@/lib/auth";

export async function DELETE(
    _req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const authResult = await getAuthUserId();
        if ("error" in authResult) return authResult.error;

        const deleted = await deleteCampaign(params.id, authResult.userId);
        if (!deleted) {
            return NextResponse.json({ error: "Campaign not found." }, { status: 404 });
        }

        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: "Failed to delete campaign." }, { status: 500 });
    }
}
