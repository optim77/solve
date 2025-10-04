import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/superbase/server";

export async function POST(req: Request) {
    try {
        const { id, email, created_at, name } = await req.json();

        if (!id || !email) {
            return new NextResponse("Missing userId or email", { status: 400 });
        }

        const customer = await stripe.customers.create({
            email,
            metadata: { user_id: id },
        });

        const supabase = await createClient();

        const { error } = await supabase
            .from("profiles")
            .upsert({
                user_id: id,
                name: name ?? null,
                created_at: created_at ?? new Date().toISOString(),
                stripe_customer_id: customer.id,
            });

        if (error) {
            console.error("❌ Supabase error:", error.message);
            return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
        }

        return NextResponse.json({ customerId: customer.id });
    } catch (err) {
        console.error("❌ Error creating Stripe customer:", err);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
