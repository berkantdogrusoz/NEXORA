import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase";

export async function GET() {
    try {
        const authResult = await getAuthUserId();
        if ("error" in authResult) return authResult.error;

        const supabase = createSupabaseServer();

        // Give the user 100 free credits for testing
        const { error } = await supabase
            .from("user_credits")
            .upsert(
                { user_id: authResult.userId, credits: 100, updated_at: new Date().toISOString() },
                { onConflict: "user_id" }
            );

        if (error) {
            throw error;
        }

        // Return a simple HTML response that redirects to the studio
        return new NextResponse(`
            <html>
                <body style="background: black; color: white; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; text-align: center;">
                    <div>
                        <h1 style="color: #4ade80;">100 Credits Added! 🎉</h1>
                        <p>Going back to the studio in 2 seconds...</p>
                        <script>
                            setTimeout(() => {
                                window.location.href = "/studio";
                            }, 2000);
                        </script>
                    </div>
                </body>
            </html>
        `, {
            headers: {
                "Content-Type": "text/html",
            },
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
