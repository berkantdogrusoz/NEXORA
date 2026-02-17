import { createSupabaseServer } from "./supabase";

export async function uploadImageFromUrl(imageUrl: string, folder = "generated"): Promise<string | null> {
    try {
        console.log("Downloading image from:", imageUrl);
        // 1. Download image
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error(`Failed to download image: ${response.statusText}`);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 2. Generate filename
        const filename = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
        const supabase = createSupabaseServer();
        const bucket = "instagram-images";

        // 3. Ensure bucket exists (optional, mostly done in dashboard, but good to try)
        // Note: Creating bucket via client requires permissions, usually set up in dashboard.
        // We assume bucket "instagram-images" or "public" exists. 
        // If "instagram-images" doesn't exist, we might fail. 
        // For MVP, if this fails, we might fall back to the original URL (but it expires).

        // 4. Upload
        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filename, buffer, {
                contentType: "image/png",
                upsert: false
            });

        if (uploadError) {
            // Try 'public' bucket if 'instagram-images' fails?
            console.error("Upload failed to instagram-images:", uploadError);
            throw uploadError;
        }

        // 5. Get Public URL
        const { data } = supabase.storage
            .from(bucket)
            .getPublicUrl(filename);

        console.log("Image uploaded to Supabase:", data.publicUrl);
        return data.publicUrl;

    } catch (error) {
        console.error("Error uploading image to Supabase:", error);
        return null; // Fallback to original URL if upload fails (though checks will fail later)
    }
}
