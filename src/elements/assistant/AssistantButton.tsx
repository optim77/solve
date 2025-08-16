import { Pencil } from "lucide-react";
import { Assistant } from "@/elements/assistant/hooks/useAssistant";

interface AssistantProps {
    id: string;
    icon: string;
    name: string;
}

interface Props {
    assistant: AssistantProps;
    onSelect: (assistant: Assistant) => void;
    isActive: boolean;
    onEdit: (id: string) => void;
}

export const AssistantButton = ({assistant, onSelect, isActive, onEdit}: Props) => {
    return (
        <div className="relative group">
            <button
                onClick={() => onSelect(assistant)}
                className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-200 text-left w-full
                    ${isActive
                    ? "bg-gray-800 border border-blue-500 shadow-lg"
                    : "bg-gray-800 border border-gray-700 hover:border-blue-400"}
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
            </button>
            {/*<button*/}
            {/*    onClick={() => onEdit(assistant.id)}*/}
            {/*    className="absolute top-1/2 right-13 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-3 rounded"*/}
            {/*>*/}
            {/*    <Plus size={14} className="text-gray-400"/>*/}
            {/*</button>*/}

            <button
                onClick={() => onEdit(assistant.id)}
                className="absolute top-1/2 right-2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-3 rounded"
            >
                <Pencil size={14} className="text-gray-400"/>
            </button>

        </div>
    );
};
