import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
    const user = await currentUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const assistantId = searchParams.get("assistantId");

    if (!assistantId) {
        return NextResponse.json({ error: "Missing parameter" }, { status: 400 });
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
        .from("conversations")
        .select("id")
        .eq("clerk_id", user.id)
        .eq("assistant_id", assistantId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    console.log(error);

    if (error && error.code !== "PGRST116") { // PGRST116 = brak danych
        console.error("Supabase error:", error);
        return NextResponse.json(
            { error: "Database error" },
            { status: 500 }
        );
    }

    return NextResponse.json({ conversationId: data?.id });
}
