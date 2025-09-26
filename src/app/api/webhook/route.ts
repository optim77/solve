import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import Stripe from "stripe";

export async function POST(req: Request) {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(
            body,
            sig!,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err) {
        if (err instanceof Error) {
            console.error("❌ Webhook signature verification failed:", err.message);
            return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
        }
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        switch (event!.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                console.log(session);

                if (session.mode === "subscription" && session.subscription) {

                    const subscription = await stripe.subscriptions.retrieve(
                        session.subscription as string
                    );
                    if (!session.client_reference_id) {
                        throw new Error("Missing client_reference_id");
                    }

                    const { data: plan, error: planError } = await supabase
                        .from("plans")
                        .select("id, credits")
                        .eq("stripe_price_id", subscription.items.data[0].price.id)
                        .single();

                    if (planError || !plan) {
                        throw new Error("Plan not found for given Stripe Price ID");
                    }

                    await supabase
                        .from("profiles")
                        .upsert(
                            {
                                user_id: session.client_reference_id,
                                stripe_customer_id: session.customer as string,
                                subscription_id: subscription.id,
                                plan_id: plan.id,
                                active_sub: subscription.status === "active",
                            },
                            { onConflict: "user_id" }
                        );

                    await supabase.from("purchase").insert({
                        user_id: session.client_reference_id,
                        plans_id: plan.id,
                        checkout_session_id: session.id,
                        subscription_id: subscription.id,
                    });


                } else {

                    const checkoutSession = await stripe.checkout.sessions.retrieve(
                        session.id,
                        { expand: ["line_items.data.price.product"] }
                    );
                    const lineItem = checkoutSession.line_items?.data[0];
                    const product = lineItem?.price?.product as Stripe.Product;

                    if (!session.client_reference_id) {
                        throw new Error("Missing client_reference_id for one-time purchase");
                    }

                    const { data: profile } = await supabase
                        .from("profiles")
                        .select("credits")
                        .eq("user_id", session.client_reference_id)
                        .single();

                    const creditsToAdd = parseInt(product.name ?? "0", 10);
                    const newCredits = (profile?.credits ?? 0) + creditsToAdd;

                    await supabase
                        .from("profiles")
                        .update({ credits: newCredits })
                        .eq("user_id", session.client_reference_id);

                    await supabase.from("purchase").insert({
                        user_id: session.client_reference_id,
                        credits_id: session.metadata?.productId,
                        checkout_session_id: session.id,
                    });
                }
                await upsertUserCredits(
                    session.metadata?.stripePriceId as string,
                    session.customer as string,
                    supabase,
                    session.client_reference_id
                );
                break;
            }

            case "customer.subscription.created":
            case "customer.subscription.updated": {
                const subscription = event.data.object as Stripe.Subscription;

                const { data: plan, error: planError } = await supabase
                    .from("plans")
                    .select("id, credits, stripe_price_id")
                    .eq("stripe_price_id", subscription.items.data[0].price.id)
                    .single();

                if (planError || !plan) {
                    throw new Error("Plan not found for given Stripe Price ID");
                }

                await supabase
                    .from("profiles")
                    .update({
                        subscription_id: subscription.id,
                        plan_id: plan.id,
                        active_sub: subscription.status === "active",
                    })
                    .eq("stripe_customer_id", subscription.customer);
                console.log("JINX", subscription)
                console.log("JINX", subscription.items.data[0])
                await upsertUserCredits(
                    plan.stripe_price_id,
                    subscription.customer as string,
                    supabase
                );
                break;
            }


            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription;

                await supabase
                    .from("profiles")
                    .update({
                        active_sub: false,
                        subscription_id: null,
                        plan_id: null,
                        renewal_date: null,
                    })
                    .eq("stripe_customer_id", subscription.customer);

                break;
            }

            case "invoice.payment_failed": {
                console.log("❌ Payment failed:", event.data.object);
                break;
            }

            default:
                console.log(`Unhandled event type`);
        }

        return NextResponse.json({ received: true });
    } catch (err) {
        if (err instanceof Error) {
            console.error("⚠️ Webhook error:", err.message);
            return new NextResponse("Webhook error", { status: 500 });
        }
    }
}

const upsertUserCredits = async (
    stripePriceId: string,
    customer: string,
    supabase: SupabaseClient,
    userId?: string
) => {
    try {
        if (!stripePriceId) return;

        let profileQuery = supabase.from("profiles").select("credits").maybeSingle();
        if (userId) {
            profileQuery = supabase.from("profiles").select("credits").eq("user_id", userId).maybeSingle();
        } else {
            profileQuery = supabase.from("profiles").select("credits").eq("stripe_customer_id", customer).maybeSingle();
        }

        const { data: userCredits } = await profileQuery;

        const { data: planCredits } = await supabase
            .from("plans")
            .select("credits")
            .eq("stripe_price_id", stripePriceId)
            .single();

        if (!planCredits) return;

        const addedUsersCredits = (userCredits?.credits ?? 0) + planCredits.credits;

        // aktualizacja kredytów
        const updateQuery = supabase.from("profiles").update({ credits: addedUsersCredits });
        if (userId) {
            await updateQuery.eq("user_id", userId);
        } else {
            await updateQuery.eq("stripe_customer_id", customer);
        }
    } catch (err) {
        if (err instanceof Error) {
            console.error("❌ upsertUserCredits error:", err.message);
        }
    }
};


