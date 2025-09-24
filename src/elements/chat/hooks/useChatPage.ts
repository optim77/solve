import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/superbase/client";
import toast from "react-hot-toast";
import { Assistant } from "@/elements/assistant/hooks/useAssistant";

type Message = { role: "user" | "assistant" | "system"; content: string; created_at?: string };

export const useChatPage = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [selectedAssistant, setSelectedAssistant] = useState<Assistant>();
    const [selectedChat, setSelectedChat] = useState("");
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const LIMIT = 20;
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // dark mode toggle
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
        setInput("");

        const loadingMessage: Message = { role: "assistant", content: "" };
        setMessages((prev) => [...prev, loadingMessage]);

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

            if (!res.body) throw new Error("No response body");

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let assistantMessage = "";

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                assistantMessage += decoder.decode(value, { stream: true });

                setMessages((prev) => {
                    const withoutLoading = prev.filter((m) => m.content !== "...");
                    return [...withoutLoading.slice(0, -1), { role: "assistant", content: assistantMessage }];
                });
            }
        } catch (err) {
            console.error(err);
            toast.error("Stream error");
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

    return {
        messages,
        input,
        setInput,
        selectedAssistant,
        setSelectedAssistant,
        selectedChat,
        setSelectedChat,
        loading,
        sendMessage,
        chatContainerRef,
        handleScroll,
    };
};
