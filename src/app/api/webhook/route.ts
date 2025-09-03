import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";


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
        console.error("Webhook signature verification failed.", err.message);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as any;

                if (session.mode === "subscription") {

                    await supabase
                        .from("subscriptions")
                        .upsert({
                            user_id: session.client_reference_id,
                            plan_id: session.metadata.productId,
                            months: 1,
                            active: true
                        }, {
                            onConflict: "user_id",
                            ignoreDuplicates: false
                        });

                    const {  error } = await supabase.rpc('insert_purchase_subscription', {
                        uid: session.client_reference_id,
                        plans_id: session.metadata.productId,
                        checkout_session_id: session.checkout_session_id
                    });
                    if (error){
                        throw error;
                    }
                } else {

                    const { data: userCredits } = await supabase
                        .from("profiles")
                        .select("credits")
                        .eq("user_id", session.client_reference_id)
                        .single();

                    console.log(userCredits);
                    if (userCredits) {

                        await supabase.rpc("increment_credits", {
                            user_id: session.client_reference_id,
                            amount: userCredits.credits,
                            checkout_session_id: session.checkout_session_id
                        });
                    }

                    const {  error } = await supabase
                        .from("purchase")
                        .insert({
                            "user_id": session.client_reference_id,
                            "credits_id": session.metadata.productId,
                            "checkout_session_id": session.checkout_session_id
                        })
                        .select()
                        .single();
                        // .rpc('insert_purchase_credits', {
                        // uid: session.client_reference_id,
                        // credits_id: session.metadata.productId,
                        // checkout_session_id: session.checkout_session_id
                    if (error){
                        throw error;
                    }
                }
                break;
            }

            case "invoice.payment_failed": {
                console.log("Payment failed", event.data.object);
                break;
            }
        }

        return NextResponse.json({ received: true });
    } catch (err: any) {
        console.error("Webhook error:", err.message);
        return new NextResponse("Webhook error", { status: 500 });
    }
}
