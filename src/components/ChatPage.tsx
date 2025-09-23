"use client"
import Markdown from "react-markdown";
import AssistantSelector from "@/components/AssistantSelector";
import ChatSelector from "@/components/ChatSelector";
import { BlankChatMessage } from "@/elements/chat/BlankChatMessage";
import { useChatPage } from "@/elements/chat/hooks/useChatPage";


export default function ChatPage() {
    const {
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
    } = useChatPage();

    return (
        <div className="grid grid-cols-3 gap-10">
            <div>
                <ChatSelector selected={selectedChat} onSelect={setSelectedChat} />
            </div>

            <div className="flex flex-col h-screen p-6">
                <div
                    ref={chatContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 rounded-lg mb-4 p-4 flex flex-col gap-3 overflow-y-auto"
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
                            className={`max-w-xl p-3 rounded-2xl text-sm ${
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
