"use client";

import { useEffect, useRef, useState } from "react";
import AssistantSelector from "@/components/AssistantSelector";
import { assistants } from "@/data/assistants";
import toast from "react-hot-toast";

type Message = { role: "user" | "assistant" | "system"; content: string };

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [selectedAssistant, setSelectedAssistant] = useState("doctor");
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const LIMIT = 20;
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const fetchLatestConversation = async () => {
        try {
            const res = await fetch(`/api/conversations/latest?assistantId=${selectedAssistant}`);

            if (!res.ok) {
                toast.error("Błąd połączenia z serwerem");
                return;
            }

            const data = await res.json();

            if (data.conversationId) {
                setConversationId(data.conversationId);
                setMessages([]);
                setHasMore(true);
                fetchMessages(data.conversationId, 0);
            } else {

                setConversationId(null);
                setMessages([]);
                setHasMore(false);
            }

        } catch (err) {
            toast.error("Wystąpił błąd pobierania rozmowy");
        }
    };

    const fetchMessages = async (convId: string, offset: number) => {
        setLoading(true);
        try {
            const res = await fetch(
                `/api/messages?conversationId=${convId}&limit=${LIMIT}&offset=${offset}`
            );
            const data = await res.json();

            if (data.messages.length < LIMIT) {
                setHasMore(false);
            }

            setMessages((prev) => [...data.messages.reverse(), ...prev]);
        } catch {
            toast.error("Błąd pobierania wiadomości");
        }
        setLoading(false);
    };

    const sendMessage = async () => {
        if (!input.trim()) return;

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

            const text = await res.text();
            setMessages((prev) => [...prev, { role: "assistant", content: text }]);
        } catch {
            toast.error("Błąd połączenia z API");
        }
    };

    const handleScroll = () => {
        if (chatContainerRef.current && chatContainerRef.current.scrollTop === 0 && hasMore && !loading) {
            fetchMessages(conversationId!, messages.length);
        }
    };

    useEffect(() => {
        fetchLatestConversation();
    }, [selectedAssistant]);

    return (
        <div className="max-w-3xl mx-auto p-4">
            {/* Wybór asystenta */}
            <AssistantSelector selected={selectedAssistant} onSelect={setSelectedAssistant} />

            {/* Okno czatu */}
            <div
                ref={chatContainerRef}
                onScroll={handleScroll}
                className="bg-gray-800 p-4 rounded-lg min-h-[400px] max-h-[500px] mb-4 flex flex-col gap-3 overflow-y-auto"
            >
                {loading && messages.length === 0 && <div className="text-center text-gray-400">Ładowanie...</div>}
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
                        {m.content}
                    </div>
                ))}
                {loading && messages.length > 0 && (
                    <div className="text-center text-gray-400 text-xs">Ładowanie starszych wiadomości...</div>
                )}
            </div>

            {/* Pole input */}
            <div className="flex gap-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    className="flex-1 p-2 rounded bg-gray-700 text-white"
                    placeholder="Type your message..."
                />
                <button
                    onClick={sendMessage}
                    className="px-4 py-2 bg-blue-600 rounded text-white hover:bg-blue-500"
                >
                    Send
                </button>
            </div>
        </div>
    );
}
