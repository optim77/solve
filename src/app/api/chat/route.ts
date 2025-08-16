import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { useSupabaseUser } from "@/components/superbase/SupabaseUserProvider";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
    try {
        const user = useSupabaseUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { messages, assistantId, conversationId } = await req.json();

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        let convId = conversationId;

        if (!convId) {
            const { data: conv, error: convError } = await supabase
                .from("conversations")
                .insert({
                    user_id: user.user.id,
                    assistant_id: assistantId,
                    title: messages[messages.length - 1]?.content?.slice(0, 50) || "New chat"
                })
                .select()
                .single();

            if (convError) throw convError;
            convId = conv.id;
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages,
        });

        const reply = completion.choices[0].message.content || "";

        const userMessage = messages[messages.length - 1];
        await supabase.from("messages").insert({
            conversation_id: convId,
            role: "user",
            content: userMessage.content
        });

        await supabase.from("messages").insert({
            conversation_id: convId,
            role: "assistant",
            content: reply
        });

        return NextResponse.json({ reply, conversationId: convId });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
