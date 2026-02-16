import { createSupabaseServer } from "./supabase";
import type { Campaign, CampaignContent, CampaignPlatform } from "./types";

function rowToCampaign(row: Record<string, unknown>, contents: CampaignContent[] = []): Campaign {
    return {
        id: row.id as string,
        productName: row.product_name as string,
        productDescription: row.product_description as string,
        targetAudience: row.target_audience as string,
        platform: row.platform as CampaignPlatform,
        tone: (row.tone as string) || "professional",
        createdAt: new Date(row.created_at as string).getTime(),
        contents,
    };
}

function rowToContent(row: Record<string, unknown>): CampaignContent {
    return {
        id: row.id as string,
        generatedAt: new Date(row.generated_at as string).getTime(),
        platform: row.platform as CampaignPlatform,
        output: row.output as Record<string, unknown>,
    };
}

export async function getAllCampaigns(userId: string): Promise<Campaign[]> {
    const supabase = createSupabaseServer();
    const { data: rows, error } = await supabase
        .from("campaigns")
        .select("*, campaign_contents(*)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return (rows || []).map((row: Record<string, unknown>) => {
        const contentRows = (row.campaign_contents as Record<string, unknown>[]) || [];
        const contents = contentRows.map(rowToContent);
        return rowToCampaign(row, contents);
    });
}

export async function getCampaignById(campaignId: string, userId: string): Promise<Campaign | null> {
    const supabase = createSupabaseServer();
    const { data, error } = await supabase
        .from("campaigns")
        .select("*, campaign_contents(*)")
        .eq("id", campaignId)
        .eq("user_id", userId)
        .single();

    if (error || !data) return null;
    const contentRows = (data.campaign_contents as Record<string, unknown>[]) || [];
    return rowToCampaign(data, contentRows.map(rowToContent));
}

export async function createCampaign(
    userId: string,
    input: {
        productName: string;
        productDescription: string;
        targetAudience: string;
        platform: CampaignPlatform;
        tone: string;
    }
): Promise<Campaign> {
    const supabase = createSupabaseServer();
    const { data, error } = await supabase
        .from("campaigns")
        .insert({
            user_id: userId,
            product_name: input.productName.trim(),
            product_description: input.productDescription.trim(),
            target_audience: input.targetAudience.trim(),
            platform: input.platform,
            tone: input.tone.trim() || "professional",
        })
        .select()
        .single();

    if (error || !data) throw new Error(error?.message || "Failed to create campaign");
    return rowToCampaign(data);
}

export async function addContentToCampaign(
    campaignId: string,
    userId: string,
    platform: CampaignPlatform,
    output: Record<string, unknown>
): Promise<CampaignContent> {
    // Verify ownership
    const campaign = await getCampaignById(campaignId, userId);
    if (!campaign) throw new Error("Campaign not found.");

    const supabase = createSupabaseServer();
    const { data, error } = await supabase
        .from("campaign_contents")
        .insert({
            campaign_id: campaignId,
            platform,
            output,
        })
        .select()
        .single();

    if (error || !data) throw new Error(error?.message || "Failed to save content");
    return rowToContent(data);
}

export async function deleteCampaign(id: string, userId: string): Promise<boolean> {
    const supabase = createSupabaseServer();
    const { error } = await supabase
        .from("campaigns")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

    return !error;
}
