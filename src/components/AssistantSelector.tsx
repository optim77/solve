"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/superbase/client";
import { AssistantButton } from "@/elements/AssistantButton";
import { NewAssistantButton } from "@/elements/NewAssistantButton";
import { EditAssistantModal } from "@/elements/EditAssistantModal";
import toast from "react-hot-toast";
import { useSupabaseUser } from "@/elements/hooks/useUser";

interface Props {
    selected: string;
    onSelect: (id: string) => void;
}

interface Assistant {
    id: string;
    name: string;
    icon: string;
    assistant_id: string;
}

export default function AssistantSelector({ selected, onSelect }: Props) {
    const user = useSupabaseUser();
    const [assistants, setAssistants] = useState<Assistant[]>([]);
    const [loading, setLoading] = useState(true);

    const [editId, setEditId] = useState<string | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const fetchAssistants = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const { data, error } = await createClient()
                .from("user_assistants")
                .select("id, name, icon, assistant_id")
                .eq("user", user.user.id)
                .order("created_at", { ascending: true });

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
    }, [user]);

    const handleEdit = (id: string) => {
        setEditId(id);
        setIsEditOpen(true);
    };

    return (
        <div className="flex flex-col gap-2 p-3 rounded-lg w-80 fixed right-0 top-0 h-full overflow-y-auto">
            {loading && <p className="text-gray-400 text-sm">Loading assistants...</p>}

            {!loading && assistants.length === 0 && (
                <p className="text-gray-400 text-sm">No assistants yet</p>
            )}

            {assistants.map((assistant) => {
                const isActive = selected === assistant.assistant_id;
                return (
                    <AssistantButton
                        key={assistant.id}
                        assistant={assistant}
                        onSelect={onSelect}
                        isActive={isActive}
                        onEdit={handleEdit}
                    />
                );
            })}

            <NewAssistantButton onAdded={fetchAssistants} />

            {editId && (
                <EditAssistantModal
                    assistantId={editId}
                    isOpen={isEditOpen}
                    onClose={() => setIsEditOpen(false)}
                    onEdited={fetchAssistants}
                />
            )}
        </div>
    );
}
