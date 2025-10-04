import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { createUserClient } from "@/lib/superbase/serverUserClient";

export async function POST(req: Request) {
    try {
        const supabase = await createUserClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { selectedChat, assistant, messages } = await req.json();
        const lastMessage = messages.at(-1);
        let convId = selectedChat;

        if (!convId) {
            const { data: conv, error } = await supabase
                .from("chats")
                .insert({
                    user_id: user.id,
                    assistant_id: assistant?.id ?? null,
                    title: lastMessage?.content?.slice(0, 50) || "New chat",
                })
                .select()
                .single();

            if (error || !conv) throw error;
            convId = conv.id;
        }

        const systemPrompt = assistant?.prompt ?? "";
        const model = assistant?.model ?? "gpt-4o-mini";

        const stream = await openai.chat.completions.create({
            model,
            stream: true,
            temperature: 1,
            max_completion_tokens: 256,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
            messages: [
                { role: "system", content: systemPrompt },
                ...messages,
            ],
        });

        const encoder = new TextEncoder();
        let fullReply = "";

        const readable = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of stream) {
                        const token = chunk.choices[0]?.delta?.content ?? "";
                        if (token) {
                            fullReply += token;
                            controller.enqueue(encoder.encode(token));
                        }
                    }

                    await supabase.from("messages").insert([
                        {
                            chat_id: convId,
                            user_id: user.id,
                            role: "user",
                            assistant_id: assistant?.id ?? null,
                            content: lastMessage.content,
                        },
                        {
                            chat_id: convId,
                            user_id: user.id,
                            assistant_id: assistant?.id ?? null,
                            role: "assistant",
                            content: fullReply,
                        },
                    ]);
                } catch (error) {
                    console.error("Stream error:", error);
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
    } catch (error) {
        console.error("POST /chat error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
