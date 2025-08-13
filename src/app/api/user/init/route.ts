'use server'

import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export async function POST() {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data: existing } = await supabase
            .from("users")
            .select("*")
            .eq("clerk_id", user.id)
            .single();

        if (!existing) {
            await supabase.from("users").insert({
                clerk_id: user.id,
                email: user.emailAddresses[0]?.emailAddress || null,
                name: user.firstName || null
            });
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
