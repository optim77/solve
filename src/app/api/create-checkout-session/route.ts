import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export async function POST(req: Request) {
    try {

        const { packId, userId } = await req.json();

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: creditPack, error } = await supabase
            .from("credits")
            .select("id, credits, stripe_price_id")
            .eq("id", packId)
            .single();

        if (error || !creditPack) {
            console.error("❌ Credit pack not found:", error?.message);
            return NextResponse.json({ error: "Invalid credit pack" }, { status: 404 });
        }

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: creditPack.stripe_price_id,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failure`,
            client_reference_id: userId,
            metadata: {
                type: "credits",
                creditPackId: creditPack.id,
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid request data", details: error.errors },
                { status: 400 }
            );
        }

        console.error("❌ Error creating checkout session:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
