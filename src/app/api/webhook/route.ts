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
    } catch (err) {
        if (err instanceof Error) {
            console.error("❌ Webhook signature verification failed:", err.message);
            return new NextResponse(`Webhook Error: ${err.message}`, {status: 400});
        }
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        let subscriptionId = '';
        switch (event && event.type) {
            case "checkout.session.completed": {
                if (!event) {
                    return new NextResponse("No event", { status: 400 });
                }
                const session = event.data.object as Stripe.Checkout.Session;

                if (session.mode === "subscription" && session.subscription) {
                    subscriptionId = session.subscription as string;


                    if (!session.metadata) throw new Error("Missing metadata");

                    const { data: profile, error: profileError } = await supabase
                        .from("profiles")
                        .select("subscription_id, active_sub")
                        .eq("user_id", session.client_reference_id)
                        .single();

                    if (profileError) {
                        console.error("❌ Profile fetch error:", profileError.message);
                        return new Response("Profile error", { status: 500 });
                    }

                    if (profile?.active_sub && profile?.subscription_id) {
                        const currentSub = await stripe.subscriptions.retrieve(profile.subscription_id);

                        await stripe.subscriptions.update(profile.subscription_id, {
                            items: [
                                {
                                    id: currentSub.items.data[0].id,
                                    price: session.metadata.stripePriceId
                                },
                            ],
                            proration_behavior: "create_prorations",
                        });

                        subscriptionId = profile.subscription_id;
                    }

                    const { error: upsertError } = await supabase.from("profiles").upsert(
                        {
                            user_id: session.client_reference_id,
                            plan_id: session.metadata.productId,
                            active_sub: true,
                            renewal_date: new Date().toISOString(),
                            subscription_id: subscriptionId,
                        },
                        {
                            onConflict: "user_id",
                        }
                    );

                    if (upsertError) throw upsertError;

                    const { error: purchaseError } = await supabase.from("purchase").insert({
                        user_id: session.client_reference_id,
                        plans_id: session.metadata.productId,
                        checkout_session_id: session.id,
                    });
                    await upsertUserCredits(session, supabase);

                    if (purchaseError) throw purchaseError;
                } else {
                    const checkoutSession = await stripe.checkout.sessions.retrieve(session.id, {
                        expand: ["line_items.data.price.product"],
                    });
                    const lineItem = checkoutSession.line_items?.data[0];
                    const price = lineItem?.price;
                    const product = price?.product as Stripe.Product;
                    const {data: userProfile, error: profileError} = await supabase
                        .from("profiles")
                        .select("credits")
                        .eq("user_id", session.client_reference_id)
                        .single();

                    if (profileError) throw profileError;

                    const creditsToAdd = parseInt(product.name ?? "0", 10);

                    const newCredits = (userProfile?.credits ?? 0) + creditsToAdd;

                    const {error: updateError} = await supabase
                        .from("profiles")
                        .update({credits: newCredits})
                        .eq("user_id", session.client_reference_id);

                    if (updateError) throw updateError;
                    if (!session.metadata) throw new Error()

                    const {error: purchaseError} = await supabase
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
            case "invoice.payment_succeeded": {
                const invoice = event.data.object as Stripe.Invoice;

                if (!invoice.subscription) {
                    console.warn("Invoice has no subscription, skipping");
                    break;
                }

                const subscriptionId = invoice.subscription as string;

                const subscription = await stripe.subscriptions.retrieve(subscriptionId);

                const {data: profile, error: profileError} = await supabase
                    .from("profiles")
                    .select("user_id, plan_id, credits")
                    .eq("subscription_id", subscriptionId)
                    .single();

                if (profileError || !profile) throw profileError;

                const {data: plan, error: planError} = await supabase
                    .from("plans")
                    .select("credits")
                    .eq("id", profile.plan_id)
                    .single();

                if (planError || !plan) throw planError;

                const newCredits = (profile.credits ?? 0) + plan.credits;
                await supabase
                    .from("profiles")
                    .update({
                        credits: newCredits,
                        renewal_date: new Date(subscription.current_period_end * 1000).toISOString(),
                        active_sub: true,
                    })
                    .eq("user_id", profile.user_id);

                break;
            }

            case "invoice.payment_failed": {
                if (event) {
                    console.log("❌ Payment failed", event.data.object);
                    break;
                }
            }
        }

        return NextResponse.json({received: true});
    } catch (err) {
        if (err instanceof Error) {
            console.error("⚠️ Webhook error:", err.message);
            return new NextResponse("Webhook error", {status: 500});
        }
    }
}

const upsertUserCredits = async (session, supabase) => {
    try {
        const {data: userCredits} = await supabase
            .from("profiles")
            .select("credits")
            .eq("user_id", session.client_reference_id)
            .maybeSingle();

        const {data: planCredits} = await supabase
            .from("plans")
            .select("credits")
            .eq("id", session.metadata.productId)
            .single();

        const addedUsersCredits = userCredits.credits + planCredits.credits;

        await supabase
            .from("profiles")
            .update({credits: addedUsersCredits})
            .eq("user_id", session.client_reference_id);

    } catch (err) {
        if (err instanceof Error) {
            console.error(err.message);
            return new NextResponse("Webhook error", {status: 500});
        }
    }
}
