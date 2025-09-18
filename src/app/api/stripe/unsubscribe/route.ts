import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/superbase/server";

export async function POST(req: Request) {

        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("subscription_id")
            .eq("user_id", user.id)
            .single();

        if (profileError || !profile?.subscription_id) {
            return new NextResponse("No active subscription", { status: 400 });
        }

        await stripe.subscriptions.cancel(profile.subscription_id);

        const { error: updateError } = await supabase
            .from("profiles")
            .update({
                active_sub: false,
            })
            .eq("user_id", user.id);

        if (updateError) throw updateError;

        return NextResponse.json({ success: true });

}
