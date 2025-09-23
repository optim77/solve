import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/superbase/server";

export async function POST(req: Request) {
    try {
        const { userId, email } = await req.json();

        if (!userId || !email) {
            return new NextResponse("Missing userId or email", { status: 400 });
        }

        const customer = await stripe.customers.create({
            email,
            metadata: {
                user_id: userId,
            },
        });

        const supabase = await createClient();
        await supabase
            .from("profiles")
            .update({ stripe_customer_id: customer.id })
            .eq("user_id", userId);

        return NextResponse.json({ customerId: customer.id });
    } catch (err) {
        console.error("❌ Error creating Stripe customer:", err);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
