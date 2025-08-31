"use client"
import { useEffect, useRef, useState } from "react";
import AssistantSelector from "@/components/AssistantSelector";
import toast from "react-hot-toast";
import Markdown from "react-markdown";
import { createClient } from "@/lib/superbase/client";
import { BlankChatMessage } from "@/elements/chat/BlankChatMessage";
import ChatSelector from "@/components/ChatSelector";
import { Assistant } from "@/elements/assistant/hooks/useAssistant";
import { useChatContext } from "@/components/context/ChatProvider";

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
    const { fetchChats, addChat } = useChatContext();

    // ulep
    useEffect(() => {
        document.documentElement.classList.add("dark");
        return () => {
            document.documentElement.classList.remove("dark");
        };
    }, []);

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

        const newMessage: Message = { role: "user", content: input };

        setMessages((prev) => [...prev, newMessage]);

        const loadingMessage: Message = { role: "assistant", content: "..." };
        setMessages((prev) => [...prev, loadingMessage]);

        setInput("");

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    selectedChat,
                    assistant: {
                        id: selectedAssistant?.id,
                        model: selectedAssistant?.model || "gpt-4o-mini",
                        prompt: selectedAssistant?.prompt || "",
                        name: selectedAssistant?.name || "Default",
                    },
                    messages: [...messages, newMessage],
                }),
            });

            if (!res.ok) {
                toast.error("Cannot send messages!");
                return;
            }

            const { reply, conversationId } = await res.json();

            if (!selectedChat && conversationId) {
                setSelectedChat(conversationId);
                addChat({
                    id: conversationId,
                    title: newMessage.content.slice(0, 50) || "New chat",
                });

                fetchChats();
            }

            setMessages((prev) => prev.filter((msg) => msg.content !== "..."));
            setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
        } catch {
            toast.error("Cannot connect to server");
            setMessages((prev) => prev.filter((msg) => msg.content !== "..."));
        }
    };

    const handleScroll = () => {
        if (chatContainerRef.current && chatContainerRef.current.scrollTop === 0 && hasMore && !loading) {
            fetchOlderMessages();
        }
    };

    useEffect(() => {
        if (selectedChat) {
            fetchLatestMessages(selectedChat);
        } else {
            setMessages([]);
        }
    }, [selectedChat]);

    return (
        <div className="grid grid-cols-3 gap-20">
            <div>
                <ChatSelector selected={selectedChat} onSelect={setSelectedChat} />
            </div>

            <div className="flex flex-col h-screen p-4">
                <div
                    ref={chatContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 border rounded-lg mb-4 p-4 flex flex-col gap-3 overflow-y-auto"
                >
                    {loading && messages.length === 0 && (
                        <div className="flex justify-center items-center">
                            <div className="border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                    {selectedAssistant ? (
                        <div className="text-center text-gray-400 mt-2 mb-2">
                            Using {selectedAssistant.name} assistant
                        </div>
                    ) : (
                        <div className="text-center text-gray-400">Using default assistant.</div>
                    )}
                    {messages.length === 0 && <BlankChatMessage />}
                    {messages.map((m, idx) => (
                        <div
                            key={idx}
                            className={`max-w-xs p-3 rounded-2xl text-sm ${
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
                        <div className="flex justify-center items-center h-full">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>

                <div className="flex gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        className="flex-1 p-3 rounded-full border text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Message"
                    />
                    <button
                        onClick={sendMessage}
                        className="px-6 py-3 rounded-full border text-white font-medium hover:bg-blue-500 transition"
                    >
                        Send
                    </button>
                </div>
            </div>

            <div>
                <AssistantSelector selected={selectedAssistant?.id} onSelect={setSelectedAssistant} />
            </div>
        </div>
    );
}
