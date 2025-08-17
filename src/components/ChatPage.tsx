"use client";

import { useEffect, useRef, useState } from "react";
import AssistantSelector from "@/components/AssistantSelector";
import { assistants } from "@/data/assistants";
import toast from "react-hot-toast";
import Markdown from "react-markdown";
import { createClient } from "@/lib/superbase/client";
import { BlankChatMessage } from "@/elements/chat/BlankChatMessage";
import ChatSelector from "@/components/ChatSelector";
import { Assistant } from "@/elements/assistant/hooks/useAssistant";


type Message = { role: "user" | "assistant" | "system"; content: string; created_at?: string };

export default function ChatPage() {

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [selectedAssistant, setSelectedAssistant] = useState<Assistant>();
    const [selectedChat, setSelectedChat] = useState("");
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const LIMIT = 20;
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const fetchLatestConversation = async () => {
        try {
            const { data, error } = await createClient()
                .from("chats")
                .select("id")
                .eq("assistant_id", selectedAssistant)
                .order("created_at", { ascending: false })
                .limit(1)
                .single();

            if (error) {
                console.error(error);
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
            toast.error("Error fetching conversation");
        }
    };

    const fetchLatestMessages = async (convId: string) => {
        setLoading(true);
        try {
            const { data: batch, error } = await createClient()
                .from("messages")
                .select("*")
                .eq("chat_id", convId)
                .order("created_at", { ascending: false })
                .limit(LIMIT);


            if (error) {
                console.log(error);
                toast.error("Error fetching messages!");
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
                .eq("chat_id", conversationId)
                .lt("created_at", oldest)
                .order("created_at", { ascending: false })
                .limit(LIMIT);

            if (error) {
                toast.error("Error fetching messages!");
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
        if (!input.trim()) return;

        const currentAssistant = assistants.find((a) => a.id === selectedAssistant?.id);
        const newMessage: Message = { role: "user", content: input };

        setMessages((prev) => [...prev, newMessage]);
        setInput("");

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    selectedChat,
                    assistantId: selectedAssistant,
                    messages: [
                        { role: "system", content: currentAssistant?.prompt || "" },
                        ...messages,
                        newMessage,
                    ],
                }),
            });

            if (!res.ok) {
                toast.error("Cannot send messages!");
                return;
            }

            const text = await res.json();
            setMessages((prev) => [...prev, { role: "assistant", content: text.reply }]);
        } catch {
            toast.error("Cannot connect to server");
        }
    };

    const handleScroll = () => {
        if (chatContainerRef.current && chatContainerRef.current.scrollTop === 0 && hasMore && !loading) {
            fetchOlderMessages();
        }
    };

    useEffect(() => {
        if (selectedChat){
            fetchLatestMessages(selectedChat);
        }
    }, [selectedChat]);

    return (
        <div className="grid grid-cols-3 gap-20">
            <div>
                <ChatSelector selected={selectedChat} onSelect={setSelectedChat} />
            </div>
            <div>
                <div
                    ref={chatContainerRef}
                    onScroll={handleScroll}
                    className="bg-gray-800 p-4 rounded-lg min-h-[400px] max-h-[800px] mb-4 flex flex-col gap-3 overflow-y-auto mt-10"
                >
                    {loading && messages.length === 0 && <div className="text-center text-gray-400">Loading...</div>}
                    {selectedAssistant ?
                        <div className="text-center text-gray-400">Using {selectedAssistant.name} assistant</div>
                        : <div className="text-center text-gray-400">Using default assistant.</div>
                    }
                    {messages.length === 0 && <BlankChatMessage />}
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
                <AssistantSelector selected={selectedAssistant?.id} onSelect={setSelectedAssistant}/>
            </div>
        </div>
    );
}
