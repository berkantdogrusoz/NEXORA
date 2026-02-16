import { NextResponse } from "next/server";
import { getAuthUserId, sanitizeInput } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        const authResult = await getAuthUserId();
        if ("error" in authResult) return authResult.error;

        const body = await req.json().catch(() => null);
        if (!body) return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });

        const name = sanitizeInput(body.name, 200);
        const description = sanitizeInput(body.description, 2000);

        if (name.length < 2) return NextResponse.json({ error: "Name required." }, { status: 400 });
        if (description.length < 5) return NextResponse.json({ error: "Description required." }, { status: 400 });

        const { data, error } = await supabase
            .from("store_products")
            .insert({
                user_id: authResult.userId,
                name,
                description,
                price: Math.max(0, parseFloat(body.price) || 0),
                type: body.type || "digital",
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Failed to add product." }, { status: 500 });
    }
}
