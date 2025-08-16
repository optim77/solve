import { Delete } from "lucide-react";

interface ChatProps {
    id: string;
    title: string;
}

interface Props {
    chat: ChatProps;
    onSelect: (id: string) => void;
    isActive: boolean;
    onDelete: (id: string) => void;
}

export const ChatButton = ({chat, onSelect, isActive, onDelete}: Props) => {
    return (
        <div className="relative group">
            <button
                onClick={() => onSelect(chat.id)}
                className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-200 text-left w-full
                    ${isActive
                    ? "bg-gray-800 border border-blue-500 shadow-lg"
                    : "bg-gray-800 border border-gray-700 hover:border-blue-400"}
                `}
            >
                <span
                    className={`text-sm font-medium truncate ${
                        isActive ? "text-blue-400" : "text-white"
                    }`}
                >
                    {chat.title}
                </span>
            </button>
            <button
                onClick={() => onDelete(chat.id)}
                className="absolute top-1/2 right-13 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-3 rounded"
            >
                <Delete size={14} className="text-gray-400"/>
            </button>


        </div>
    );
};
