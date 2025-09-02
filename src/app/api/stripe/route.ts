import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/superbase/server";

interface Product {
    id: string;
    stripe_product: {
        product_id: string;
        price_id: string;
    }
}

export async function POST(req: Request) {
    try {
        const headersList = await headers();
        const origin = headersList.get("origin") || process.env.NEXT_PUBLIC_APP_URL;

        const { productId, type } = await req.json();

        const supabase = await createClient();

        const { data, error } = await supabase.auth.getUser();

        let product: Product;
        if (type === "subscription") {
            const { data, error } = await supabase
                .from("plans")
                .select('id, stripe_product(product_id, price_id)')
                .eq("id", productId)
                .single();

            if (error || !data) throw new Error(error?.message);
            product = data;
        } else if (type === "credit") {
            const { data, error } = await supabase
                .from("credits")
                .select("id, stripe_product(product_id, price_id)")
                .eq("id", productId)
                .single();

            if (error || !data) throw new Error("Credits not found");
            product = data;
        } else {
            throw new Error("Invalid product type");
        }

        const price = await stripe.prices.retrieve(product.stripe_product.price_id);
        const mode = price.recurring ? "subscription" : "payment";

        const session = await stripe.checkout.sessions.create({
            line_items: [{ price: product.stripe_product.price_id, quantity: 1 }],
            mode,
            client_reference_id: data.user?.id,
            metadata: {
                productId,
                type
            },
            success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/protected/chat`,
        });

        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
