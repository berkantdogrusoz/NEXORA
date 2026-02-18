import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const { data: brands, error } = await supabase
            .from("autopilot_brands")
            .select("*");

        return NextResponse.json({
            count: brands?.length,
            brands,
            error
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message });
    }
}
