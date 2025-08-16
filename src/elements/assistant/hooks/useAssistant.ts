
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/superbase/client";
import toast from "react-hot-toast";
import { useSupabaseUser } from "@/components/superbase/SupabaseUserProvider";


export interface Assistant {
    id: string;
    name: string;
    icon: string;
}
export const useAssistant = (selected?: string) => {
    const { user } = useSupabaseUser();
    const [assistants, setAssistants] = useState<Assistant[]>([]);
    const [loading, setLoading] = useState(true);

    const [editId, setEditId] = useState<string | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const fetchAssistants = async () => {
        if (!user?.id) return;

        setLoading(true);
        try {
            const { data, error } = await createClient()
                .from("user_assistants")
                .select("id, name, icon")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) {
                toast.error("Failed to load assistants");
                console.error(error);
                return;
            }

            setAssistants(data || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssistants();
    }, [user?.id]);

    const memoizedAssistants = useMemo(() => {
        return assistants.map(a => ({
            ...a,
            isActive: a.id === selected
        }));
    }, [assistants, selected]);

    const handleEdit = (id: string) => {
        setEditId(id);
        setIsEditOpen(true);
    };

    return { loading, editId, isEditOpen, memoizedAssistants, handleEdit, fetchAssistants, setIsEditOpen };
}