 "use client";
import { useState } from "react";
import AssistantSelector from "@/components/AssistantSelector";
import ChatSelector from "@/components/ChatSelector";
import { BlankChatMessage } from "@/elements/chat/BlankChatMessage";
import { useChatPage } from "@/elements/chat/hooks/useChatPage";
import ChatMessage from "@/elements/message/ChatMessage";
import { Bot, Menu } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

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

    const [leftOpen, setLeftOpen] = useState(false);
    const [rightOpen, setRightOpen] = useState(false);

    return (
        <div className="flex h-screen">
            <div className="hiddenlg:block p-4">
                <ChatSelector selected={selectedChat} onSelect={setSelectedChat} />
            </div>

            <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
                <div className="lg:hidden flex items-center justify-between p-4">
                    <Sheet open={leftOpen} onOpenChange={setLeftOpen}>
                        <SheetTrigger asChild>
                            <button className="p-2 rounded hover:bg-gray-800">
                                <Menu className="w-6 h-6"/>
                            </button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-72">
                            <SheetHeader>
                                <SheetTitle>
                                </SheetTitle>
                            </SheetHeader>
                            <div className="mt-6">
                                <ChatSelector
                                    selected={selectedChat}
                                    onSelect={(id) => {
                                        setSelectedChat(id);
                                        setLeftOpen(false);
                                    }}
                                />
                            </div>
                        </SheetContent>
                    </Sheet>

                    <p className="text-lg font-semibold">Chat</p>

                    <Sheet open={rightOpen} onOpenChange={setRightOpen}>
                        <SheetTrigger asChild>
                            <button className="p-2 rounded hover:bg-gray-800">
                                <Bot className="w-6 h-6"/>
                            </button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-72">

                            <div className="mt-6">
                                <AssistantSelector
                                    selected={selectedAssistant?.id}
                                    onSelect={(id) => {
                                        setSelectedAssistant(id);
                                        setRightOpen(false);
                                    }}
                                />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                <div
                    ref={chatContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto p-1 flex flex-col gap-3 pt-7"
                >
                    {loading && messages.length === 0 && (
                        <div className="flex justify-center items-center">
                            <div
                                className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}

                    {messages.length === 0 && <BlankChatMessage/>}
                    {messages.map((m, idx) => (
                        <ChatMessage key={idx} role={m.role} content={m.content}/>
                    ))}

                    {loading && messages.length > 0 && (
                        <div className="flex justify-center items-center h-full">
                            <div
                                className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>

                <div>
                    {selectedAssistant ? (
                        <div className="text-center text-gray-400 mt-2 mb-2 rounded-t-lg">
                            Using {selectedAssistant.name} assistant
                        </div>
                    ) : (
                        <div className="text-center text-gray-400 rounded-t-lg">
                            Using default assistant.
                        </div>
                    )}
                </div>
                <div className="p-4 flex gap-2">


                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        className="flex-1 p-3 rounded-full border text-white bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Message"
                    />
                    <button
                        onClick={sendMessage}
                        className="px-6 py-3 rounded-full border text-white font-medium hover:bg-blue-500 transition"
                    >
                        Send
                    </button>
                </div>
            </main>

            <div className="hidden lg:block p-4">
                <AssistantSelector
                    selected={selectedAssistant?.id}
                    onSelect={setSelectedAssistant}
                />
            </div>
        </div>
    );
}
