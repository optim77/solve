import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { messages, assistantId, conversationId } = await req.json();

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        let convId = conversationId;

        // Jeśli nie podano conversationId — tworzymy nową rozmowę
        if (!convId) {
            const { data: conv, error: convError } = await supabase
                .from("conversations")
                .insert({
                    clerk_id: user.id,
                    assistant_id: assistantId,
                    title: messages[messages.length - 1]?.content?.slice(0, 50) || "New chat"
                })
                .select()
                .single();

            if (convError) throw convError;
            convId = conv.id;
        }

        // OpenAI API
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages,
        });

        const reply = completion.choices[0].message.content || "";

        // Zapis wiadomości użytkownika
        const userMessage = messages[messages.length - 1];
        await supabase.from("messages").insert({
            conversation_id: convId,
            role: "user",
            content: userMessage.content
        });

        // Zapis wiadomości AI
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
