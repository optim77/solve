import { useSupabaseUser } from "@/components/superbase/SupabaseUserProvider";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/superbase/client";
import toast from "react-hot-toast";
interface Chat {
    id: string;
    title: string;
}
export const useChat = (selected: string) => {
    const { user } = useSupabaseUser();
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchChats = async () => {
        if (!user?.id) return;

        setLoading(true);
        try {
            const { data, error } = await createClient()
                .from("chats")
                .select("id, title")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) {
                toast.error("Failed to load chats");
                console.error(error);
                return;
            }

            if (data) setChats(data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChats();
    }, [user?.id]);

    const handleDelete = async (chatId: string) => {
        if (!chatId) return;

        setChats((prev) => prev.filter((c) => c.id !== chatId));

        try {
            const { error } = await createClient()
                .from("chats")
                .delete()
                .eq("id", chatId)
                .eq("user_id", user?.id);

            if (error) throw error;

            toast.success("Chat deleted successfully");
        } catch (err) {
            console.error(err);
            toast.error("Error while deleting chat");
            fetchChats();
        }
    };

    const addChat = (chat: Chat) => {
        setChats((prev) => [chat, ...prev]);
    };

    const memoizedChats = useMemo(() => {
        return chats.map((a) => ({
            ...a,
            isActive: a.id === selected,
        }));
    }, [chats, selected]);

    return { loading, memoizedChats, handleDelete, fetchChats, addChat };
};