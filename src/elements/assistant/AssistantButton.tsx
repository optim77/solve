import { Pencil } from "lucide-react";
import { Assistant } from "@/elements/assistant/hooks/useAssistant";

interface AssistantProps {
    id: string;
    icon: string;
    name: string;
    model: string;
    prompt: string;
}

interface Props {
    assistant: AssistantProps;
    onSelect: (assistant: Assistant) => void;
    isActive: boolean | undefined;
    onEdit?: (assistant: Assistant) => void;
}

export const AssistantButton = ({assistant, onSelect, isActive, onEdit}: Props) => {
    return (
        <div className="relative group">
            <button
                onClick={() => onSelect(assistant)}
                className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-200 text-left w-full cursor-pointer
                    ${isActive
                    ? " border border-blue-500 shadow-lg"
                    : " border border-gray-700 hover:border-blue-400"}
                `}
            >
                <div
                    className={`w-10 h-10 flex items-center justify-center rounded-full border-2 text-xl transition-all duration-200
                        ${isActive ? "border-blue-500" : "border-gray-700"}
                    `}
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
                <p
                    className={`text-sm font-medium truncate justify-end text-gray-400` }
                >
                    {assistant.model}
                </p>
            </button>
            {onEdit && (
                <button
                    onClick={() => onEdit(assistant)}
                    className="absolute top-1/2 right-2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-600 text-white text-xs px-3 py-3 rounded"
                >
                    <Pencil size={14} className="text-gray-400"/>
                </button>
            )}


        </div>
    );
};
