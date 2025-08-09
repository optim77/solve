import { NextRequest } from "next/server"

export const runtime = "edge" // streaming działa szybciej na Edge Runtime

export async function POST(req: NextRequest) {
    const { messages } = await req.json()

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages,
            stream: true,
        }),
    })

    const stream = new ReadableStream({
        async start(controller) {
            const reader = res.body?.getReader()
            if (!reader) {
                controller.close()
                return
            }

            let partialMessage = ""

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value)
                const lines = chunk.split("\n").filter((line) => line.trim() !== "")

                for (const line of lines) {
                    if (line === "data: [DONE]") {
                        controller.close()
                        return
                    }
                    if (line.startsWith("data: ")) {
                        try {
                            const json = JSON.parse(line.replace(/^data: /, ""))
                            const token = json.choices?.[0]?.delta?.content || ""
                            partialMessage += token
                            controller.enqueue(encoder.encode(token))
                        } catch (err) {
                            console.error("Parse error", err)
                        }
                    }
                }
            }
        },
    })

    return new Response(stream, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
}
