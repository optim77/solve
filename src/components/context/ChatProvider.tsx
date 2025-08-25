"use client";

import { createContext, useContext } from "react";
import { useChat } from "@/elements/chat/hooks/useChat";

const ChatContext = createContext<ReturnType<typeof useChat> | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const chatHook = useChat("");
    return <ChatContext.Provider value={chatHook}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
    const ctx = useContext(ChatContext);
    if (!ctx) throw new Error("useChatContext must be used inside ChatProvider");
    return ctx;
}
