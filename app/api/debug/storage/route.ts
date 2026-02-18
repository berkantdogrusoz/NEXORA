import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const bucketName = "instagram-images";

        // 1. Check if bucket exists
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        const bucketExists = buckets?.some(b => b.name === bucketName);

        // 2. Try to create if not exists (requires permissions)
        let createResult = null;
        if (!bucketExists) {
            const { data, error } = await supabase.storage.createBucket(bucketName, {
                public: true
            });
            createResult = { data, error };
        }

        // 3. Test upload
        const testFileName = `debug-test-${Date.now()}.txt`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(testFileName, "Hello World Test", { upsert: true });

        // 4. Get Public URL
        const { data: urlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(testFileName);

        return NextResponse.json({
            buckets,
            bucketExists,
            createResult,
            upload: { uploadData, uploadError },
            publicUrl: urlData.publicUrl
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message });
    }
}
