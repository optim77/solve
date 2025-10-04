import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
    try {
        const { userId } = await req.json();

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );


        const { data: profile, error } = await supabase
            .from("profiles")
            .select("stripe_customer_id")
            .eq("user_id", userId)
            .single();

        if (error || !profile?.stripe_customer_id) {
            console.error("❌ No Stripe customer found:", error?.message);
            return NextResponse.json({ error: "No customer found" }, { status: 404 });
        }

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: profile.stripe_customer_id,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/protected/chat`,
        });

        return NextResponse.json({ url: portalSession.url });
    } catch (error) {
        console.error("❌ Error creating billing portal session:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }


}
