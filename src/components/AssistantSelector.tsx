"use client";

import { assistants } from "@/data/assistants";

interface Props {
    selected: string;
    onSelect: (id: string) => void;
}

export default function AssistantSelector({ selected, onSelect }: Props) {
    return (
        <div className="flex gap-4 p-4 bg-gray-900 rounded-lg mb-4 overflow-x-auto">
            {assistants.map((assistant) => {
                const isActive = selected === assistant.id;
                return (
                    <button
                        key={assistant.id}
                        onClick={() => onSelect(assistant.id)}
                        className={`flex flex-col items-center p-3 min-w-[100px] rounded-lg border transition-all duration-200 
              ${isActive ? "border-blue-500 bg-gray-800 shadow-lg" : "border-gray-700 hover:bg-gray-800"}`}
                    >
                        <span className="text-3xl">{assistant.icon}</span>
                        <span className="text-sm font-semibold mt-2 text-white">{assistant.name}</span>
                        <span className="text-xs text-gray-400 text-center">{assistant.description}</span>
                    </button>
                );
            })}
        </div>
    );
}
