import Markdown from "react-markdown";

function ChatMessage({ role, content }: { role: string; content: string }) {
    return (
        <div
            className={`max-w-xl pr-10 pl-10pt-3 pb-1 p-3 rounded-2xl text-sm leading-relaxed ${
                role === "user"
                    ? "bg-blue-500 text-white self-end"
                    : role === "assistant"
                        ? "bg-gray-100 text-gray-900 self-start"
                        : "hidden"
            }`}
        >
            <Markdown
                components={{
                    h1: ({ children }) => (
                        <h1 className="text-xl font-bold mb-2">{children}</h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-lg font-semibold mb-2">{children}</h2>
                    ),
                    p: ({ children }) => <p className="mb-2">{children}</p>,
                    ul: ({ children }) => (
                        <ul className="list-disc list-inside mb-2">{children}</ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="list-decimal list-inside mb-2">{children}</ol>
                    ),
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-gray-400 pl-4 italic text-gray-600 mb-2">
                            {children}
                        </blockquote>
                    ),
                    code: ({ children }) => (
                        <code className="bg-gray-800 text-gray-100 px-2 py-1 rounded text-xs">
                            {children}
                        </code>
                    ),
                    a: ({ children, ...props }) => (
                        <a
                            {...props}
                            className="text-blue-600 underline"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {children}
                        </a>
                    ),
                }}
            >
                {content}
            </Markdown>
        </div>
    );
}

export default ChatMessage;
