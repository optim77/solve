"use client"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import TypingIndicator from "@/components/TypingIndicator"

export default function ChatPage() {
    const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
    const [input, setInput] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const bottomRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages, isTyping])


    const sendMessage = async () => {
        if (!input.trim()) return

        const newMessages = [...messages, { role: "user", content: input }]
        setMessages(newMessages)
        setInput("")

        setMessages((prev) => [...prev, { role: "assistant", content: "" }])

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                body: JSON.stringify({ messages: newMessages }),
            })

            if (!res.body) return

            const reader = res.body.getReader()
            const decoder = new TextDecoder()
            let done = false

            while (!done) {
                const { value, done: doneReading } = await reader.read()
                done = doneReading
                const chunkValue = decoder.decode(value)

                // Doklejamy kolejne tokeny
                setMessages((prev) => {
                    const updated = [...prev]
                    updated[updated.length - 1] = {
                        role: "assistant",
                        content: (updated[updated.length - 1].content || "") + chunkValue,
                    }
                    return updated
                })
            }
        } catch (error) {
            console.error("❌ Streaming error:", error)
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="w-full max-w-2xl flex flex-col h-[80vh] border border-gray-700 rounded-lg overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    <AnimatePresence>
                        {messages.map((m, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.2 }}
                                className={`p-2 rounded-lg ${
                                    m.role === "user" ? "bg-blue-600 ml-auto" : "bg-gray-700 mr-auto"
                                } max-w-[80%] whitespace-pre-wrap`}
                            >
                                {m.content}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="p-2 rounded-lg bg-gray-700 mr-auto max-w-[80%] italic opacity-70"
                        >
                            Bot is typing<TypingIndicator />
                        </motion.div>
                    )}

                    <div ref={bottomRef} />
                </div>

                <div className="flex items-center gap-2 p-2 border-t border-gray-700">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        className="flex-1 p-2 rounded bg-gray-800 text-white"
                        placeholder="Type a message..."
                    />
                    <button
                        onClick={sendMessage}
                        className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    )
}
