"use client";

import { assistants } from "@/data/assistants";

interface Props {
    selected: string;
    onSelect: (id: string) => void;
}

export default function AssistantSelector({ selected, onSelect }: Props) {
    return (
        <div className="flex flex-col gap-2 p-3  rounded-lg w-80 fixed right-0 top-0 h-full">
            {assistants.map((assistant) => {
                const isActive = selected === assistant.id;
                return (
                    <button
                        key={assistant.id}
                        onClick={() => onSelect(assistant.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-200 text-left
                            ${
                            isActive
                                ? "bg-gray-800 border border-blue-500 shadow-lg"
                                : "bg-gray-800 border border-gray-700 hover:border-blue-400"
                        }`}
                    >
                        <div
                            className={`w-10 h-10 flex items-center justify-center rounded-full border-2 text-xl transition-all duration-200
                            ${isActive ? "border-blue-500" : "border-gray-700"}`}
                        >
                            {assistant.icon}
                        </div>
                        <span
                            className={`text-sm font-medium truncate ${
                                isActive ? "text-blue-400" : "text-white"
                            }`}
                        >
                            {assistant.name}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
