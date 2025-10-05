// src/app/api/auth/check-email/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/superbase/server";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Missing email" }, { status: 400 });
        }

        const supabase = await createClient();

        const { data, error } = await supabase
            .from("profiles")
            .select("user_id")
            .ilike("email", email)
            .maybeSingle();

        if (error) {
            console.error("Supabase error:", error.message);
            return NextResponse.json({ error: "Database error" }, { status: 500 });
        }

        return NextResponse.json({ exists: !!data });
    } catch (err) {
        console.error("❌ check-email error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
