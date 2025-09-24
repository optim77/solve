import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
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
        );

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { selectedChat, assistant, messages } = await req.json();
        let convId = selectedChat;

        if (!convId) {
            const { data: conv, error: convError } = await supabase
                .from("chats")
                .insert({
                    user_id: user.id,
                    assistant_id: assistant?.id ?? null,
                    title: messages[messages.length - 1]?.content?.slice(0, 50) || "New chat",
                })
                .select()
                .single();
            if (convError) throw convError;
            convId = conv.id;
        }

        const systemPrompt = assistant?.prompt || "";
        const model = assistant?.model || "gpt-4o-mini";

        const stream = await openai.chat.completions.create({
            model,
            messages: [
                { role: "system", content: systemPrompt },
                ...messages,
            ],
            stream: true,
        });

        const encoder = new TextEncoder();
        let fullReply = "";

        const readable = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of stream) {
                        const token = chunk.choices[0]?.delta?.content || "";
                        if (token) {
                            fullReply += token;
                            controller.enqueue(encoder.encode(token));
                        }
                    }

                    const userMessage = messages[messages.length - 1];

                    await supabase.from("messages").insert({
                        chat_id: convId,
                        user_id: user.id,
                        role: "user",
                        assistant_id: assistant?.id ?? null,
                        content: userMessage.content,
                    });

                    await supabase.from("messages").insert({
                        chat_id: convId,
                        user_id: user.id,
                        assistant_id: assistant?.id ?? null,
                        role: "assistant",
                        content: fullReply,
                    });
                } catch (err) {
                    console.error("Stream error:", err);
                } finally {
                    controller.close();
                }
            },
        });

        return new NextResponse(readable, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-cache, no-transform",
                Connection: "keep-alive",
            },
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
