"use client";

import { useEffect, useRef, useState } from "react";
import AssistantSelector from "@/components/AssistantSelector";
import { assistants } from "@/data/assistants";
import toast from "react-hot-toast";
import Markdown from "react-markdown";
import { createClient } from "@/lib/superbase/client";


type Message = { role: "user" | "assistant" | "system"; content: string; created_at?: string };

export default function ChatPage() {

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [selectedAssistant, setSelectedAssistant] = useState("mechanic");
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const LIMIT = 20;
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const fetchLatestConversation = async () => {
        try {
            const { data, error } = await createClient()
                .from("conversations")
                .select("id")
                .eq("assistant_id", selectedAssistant)
                .order("created_at", { ascending: false })
                .limit(1)
                .single();

            if (error) {
                toast.error("Błąd pobierania rozmowy");
                return;
            }

            if (data?.id) {
                setConversationId(data.id);
                setMessages([]);
                setHasMore(true);
                await fetchLatestMessages(data.id);
            } else {
                setConversationId(null);
                setMessages([]);
                setHasMore(false);
            }
        } catch {
            toast.error("Wystąpił błąd pobierania rozmowy");
        }
    };

    const fetchLatestMessages = async (convId: string) => {
        setLoading(true);
        try {
            const { data: batch, error } = await createClient()
                .from("messages")
                .select("*")
                .eq("conversation_id", convId)
                .order("created_at", { ascending: false })
                .limit(LIMIT);

            if (error) {
                toast.error("Błąd pobierania wiadomości");
                return;
            }

            const batchAsc = (batch ?? []).slice().reverse();
            setMessages(batchAsc);

            requestAnimationFrame(() => {
                if (chatContainerRef.current) {
                    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
                }
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchOlderMessages = async () => {
        if (!conversationId || !messages.length || loading) return;
        setLoading(true);

        try {
            const oldest = messages[0].created_at;

            const { data: batch, error } = await createClient()
                .from("messages")
                .select("*")
                .eq("conversation_id", conversationId)
                .lt("created_at", oldest)
                .order("created_at", { ascending: false })
                .limit(LIMIT);

            if (error) {
                toast.error("Błąd pobierania starszych wiadomości");
                return;
            }

            if (!batch?.length) {
                setHasMore(false);
                return;
            }

            const batchAsc = batch.slice().reverse();
            const container = chatContainerRef.current;

            if (container) {
                const prevHeight = container.scrollHeight;
                setMessages((prev) => [...batchAsc, ...prev]);
                requestAnimationFrame(() => {
                    container.scrollTop = container.scrollHeight - prevHeight;
                });
            } else {
                setMessages((prev) => [...batchAsc, ...prev]);
            }
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!input.trim() || !conversationId) return;

        const currentAssistant = assistants.find((a) => a.id === selectedAssistant);
        const newMessage: Message = { role: "user", content: input };

        setMessages((prev) => [...prev, newMessage]);
        setInput("");

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    conversationId,
                    assistantId: selectedAssistant,
                    messages: [
                        { role: "system", content: currentAssistant?.prompt || "" },
                        ...messages,
                        newMessage,
                    ],
                }),
            });

            if (!res.ok) {
                toast.error("Błąd wysyłania wiadomości");
                return;
            }

            const text = await res.json();
            setMessages((prev) => [...prev, { role: "assistant", content: text.reply }]);
        } catch {
            toast.error("Błąd połączenia z serwerem");
        }
    };

    const handleScroll = () => {
        if (chatContainerRef.current && chatContainerRef.current.scrollTop === 0 && hasMore && !loading) {
            fetchOlderMessages();
        }
    };

    useEffect(() => {
        fetchLatestConversation();
    }, [selectedAssistant]);



    return (
        <div className="grid grid-cols-3 gap-20">
            <div>
                chats
            </div>
            <div>
                <div
                    ref={chatContainerRef}
                    onScroll={handleScroll}
                    className="bg-gray-800 p-4 rounded-lg min-h-[400px] max-h-[800px] mb-4 flex flex-col gap-3 overflow-y-auto"
                >
                    {loading && messages.length === 0 && <div className="text-center text-gray-400">Loading...</div>}
                    {messages.map((m, idx) => (
                        <div
                            key={idx}
                            className={`max-w-xs p-3 rounded-lg text-sm ${
                                m.role === "user"
                                    ? "bg-blue-500 text-white self-end"
                                    : m.role === "assistant"
                                        ? "bg-gray-200 text-gray-900 self-start"
                                        : "hidden"
                            }`}
                        >
                            <Markdown>{m.content}</Markdown>
                        </div>
                    ))}
                    {loading && messages.length > 0 && (
                        <div className="text-center text-gray-400 text-xs">Loading older messages...</div>
                    )}
                </div>

                <div className="flex gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        className="flex-1 p-2 rounded bg-gray-700 text-white"
                        placeholder="Type a message..."
                    />
                    <button
                        onClick={sendMessage}
                        className="px-4 py-2 bg-blue-600 rounded text-white hover:bg-blue-500"
                    >
                        Send
                    </button>
                </div>
            </div>


            <div>
                <AssistantSelector selected={selectedAssistant} onSelect={setSelectedAssistant}/>
            </div>
        </div>
    );
}
