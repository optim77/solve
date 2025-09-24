import { Trash } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
                className={`flex items-center gap-2 pt-4 pb-4 pl-4 rounded-lg transition-all duration-200 text-left w-full cursor-pointer
                    ${isActive
                    ? "border border-blue-500 shadow-lg"
                    : "border border-gray-700 hover:border-blue-400"}
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

                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="absolute top-1/2 right-3 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-3 rounded cursor-pointer">
                            <Trash size={14} className="text-gray-400 "/>
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Are you absolutely sure?</DialogTitle>
                        </DialogHeader>
                        <DialogDescription>
                            Once the chat has been deleted, it cannot be restored.
                        </DialogDescription>
                        <DialogFooter>
                            <Button
                                onClick={() => onDelete(chat.id)}
                            >
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>




</div>
)
    ;
};
