import { useChat } from "@/elements/chat/hooks/useChat";
import { ChatButton } from "@/elements/chat/ChatButton";

interface Props {
    selected: string;
    onSelect: (id: string) => void;
}
export default function ChatSelector({ selected, onSelect }: Props) {

    const { loading, memoizedChats, handleDelete } = useChat(selected);

    return (
        <div className="flex flex-col gap-2 p-3 rounded-lg w-80 fixed left-0 top-0 h-full overflow-y-auto border-r-3">
            {loading && <p className="text-gray-400 text-sm">Loading chats...</p>}

            {!loading && memoizedChats.length === 0 && (
                <p className="text-gray-400 text-sm text-center">No chats yet</p>
            )}

            {memoizedChats.map((chat) => (
                <ChatButton
                    key={chat.id}
                    chat={chat}
                    onSelect={onSelect}
                    isActive={chat.isActive}
                    onDelete={handleDelete}
                />
            ))}



        </div>
    )

}