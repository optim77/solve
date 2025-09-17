import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

export async function POST(req: Request) {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            sig!,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        console.error("❌ Webhook signature verification failed:", err.message);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        let subscriptionId = '';
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as any;
                console.log(session);

                if (session.mode === "subscription") {
                    subscriptionId = session.subscription;
                    const { data: sub, error: subError } = await supabase
                        .from("profiles")
                        .select("months")
                        .eq("user_id", session.client_reference_id)
                        .maybeSingle();

                    if (subError) throw subError;

                    const monthsCounter = sub?.months ? sub.months + 1 : 1;

                    const { error: upsertError } = await supabase
                        .from("profiles")
                        .upsert(
                            {
                                user_id: session.client_reference_id,
                                plan_id: session.metadata.productId,
                                months: monthsCounter,
                                active_sub: true,
                                renewal_date: new Date().toISOString(),
                                subscription_id: subscriptionId
                            },
                            {
                                onConflict: "user_id",
                            }
                        );

                    if (upsertError) throw upsertError;

                    const { error: purchaseError } = await supabase
                        .from("purchase")
                        .insert({
                            user_id: session.client_reference_id,
                            plans_id: session.metadata.productId,
                            checkout_session_id: session.id,
                        });

                    if (purchaseError) throw purchaseError;
                } else {
                    const checkoutSession = await stripe.checkout.sessions.retrieve(session.id, {
                        expand: ["line_items.data.price.product"],
                    });
                    const lineItem = checkoutSession.line_items?.data[0];
                    const price = lineItem?.price;
                    const product = price?.product as Stripe.Product;
                    const { data: userProfile, error: profileError } = await supabase
                        .from("profiles")
                        .select("credits")
                        .eq("user_id", session.client_reference_id)
                        .single();

                    if (profileError) throw profileError;

                    const creditsToAdd = parseInt(product.name ?? "0", 10);

                    const newCredits = (userProfile?.credits ?? 0) + creditsToAdd;

                    const { error: updateError } = await supabase
                        .from("profiles")
                        .update({ credits: newCredits })
                        .eq("user_id", session.client_reference_id);

                    if (updateError) throw updateError;

                    const { error: purchaseError } = await supabase
                        .from("purchase")
                        .insert({
                            user_id: session.client_reference_id,
                            credits_id: session.metadata.productId,
                            checkout_session_id: session.id,
                            subscription_id: subscriptionId
                        });

                    if (purchaseError) throw purchaseError;
                }
                break;
            }

            case "invoice.payment_failed": {
                console.log("❌ Payment failed", event.data.object);
                break;
            }
        }

        return NextResponse.json({ received: true });
    } catch (err: any) {
        console.error("⚠️ Webhook error:", err.message);
        return new NextResponse("Webhook error", { status: 500 });
    }
}
