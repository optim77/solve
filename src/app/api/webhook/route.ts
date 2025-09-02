import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs"; // 🔑

export async function POST(req: Request) {
    const sig = req.headers.get("stripe-signature");
    const body = await req.text();
    console.log("HOOK");
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

    console.log("✅ Webhook event:", event.type);

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as any;
        console.log("🎯 Session completed for:", session.id);
    }

    return NextResponse.json({ received: true });
}
