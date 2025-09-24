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
            metadata: {
                user_id: id,
            },
        });

        console.log(customer);
        console.log(id);

        const supabase = await createClient();

        const { error } = await supabase.from("profiles").upsert({
            user_id: id,
            name,
            created_at,
            stripe_customer_id: customer.id,
        });

        if (error) throw error;

        await supabase
            .from("profiles")
            .update({ stripe_customer_id: customer.id })
            .eq("user_id", id);

        return NextResponse.json({ customerId: customer.id });
    } catch (err) {
        console.error("❌ Error creating Stripe customer:", err);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
