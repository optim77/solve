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
                toast.error("Failed to load assistants");
                console.error(error);
                return;
            }

            setChats(data || []);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchChats();
    }, [user?.id]);

    const handleDelete = (chatId: string) => {

    }

    const memoizedChats = useMemo(() => {
        return chats.map(a => ({
            ...a,
            isActive: a.id === selected
        }));
    }, [chats, selected]);

    return { loading, memoizedChats, handleDelete };
}