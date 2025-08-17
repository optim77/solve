import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function getSupabaseServerClient() {
    return cookies().then((cookieStore) =>
        createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: Parameters<typeof cookieStore.set>[1]) {
                        cookieStore.set(name, value, options);
                    },
                    remove(name: string, options: Parameters<typeof cookieStore.set>[1]) {
                        cookieStore.set(name, "", { ...options, maxAge: 0 });
                    },
                },
            }
        )
    );
}

export async function POST(req: Request) {

    try {
        const supabase = await getSupabaseServerClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const {  selectedChat, assistantId, messages } = await req.json();
        console.log("messages", messages);
        console.log("assistantId", assistantId);
        console.log("selectedChat", selectedChat);
        let convId = selectedChat;

        if (!convId) {
            const { data: conv, error: convError } = await supabase
                .from("chats")
                .insert({
                    user_id: user.id,
                    assistant_id: assistantId ? assistantId : null,
                    title: messages[messages.length - 1]?.content?.slice(0, 50) || "New chat",
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

        const { error: userMsgError } = await supabase
            .from("messages")
            .insert({
                chat_id: convId,
                user_id: user.id,
                role: "user",
                assistant_id: assistantId ?? null,
                content: userMessage.content,
            })
            .select();

        if (userMsgError) {
            console.error("User message insert error:", userMsgError);
        }

        await supabase.from("messages").insert({
            chat_id: convId,
            user_id: user.id,
            assistant_id: assistantId ?? null,
            role: "assistant",
            content: reply,
        });

        return NextResponse.json({ reply, conversationId: convId });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
