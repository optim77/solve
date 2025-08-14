import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/superbase/client";
import { useSupabaseUser } from "@/elements/hooks/useUser";

export const useEditAssistantModal = (
    assistantId: string | null,
    onClose: () => void,
    onEdited?: () => void
) => {
    const [name, setName] = useState("");
    const [prompt, setPrompt] = useState("");
    const [icon, setIcon] = useState("");
    const [loading, setLoading] = useState(false);
    const { user } = useSupabaseUser();

    const fetchAssistant = async () => {
        if (!assistantId || !user) return;

        const { data, error } = await createClient()
            .from("user_assistants")
            .select("*")
            .eq("id", assistantId)
            .eq("user", user.id)
            .single();

        if (error) {
            console.error(error);
            toast.error("Failed to load assistant");
            return;
        }

        if (data) {
            setName(data.name);
            setPrompt(data.prompt);
            setIcon(data.icon || "");
        }
    };

    const handleSave = async () => {
        console.error(assistantId);
        if (!name || !prompt) {
            toast.error("Fill required fields");
            return;
        }
        try {
            setLoading(true);

            const { error } = await createClient()
                .from("user_assistants")
                .update({
                    name,
                    prompt,
                    icon,
                    assistant_id: name.toLowerCase().replace(/\s+/g, "-"),
                })
                .eq("id", assistantId)
                .eq("user", user?.id);

            if (error) throw error;

            toast.success("Assistant updated successfully");
            onEdited && onEdited();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error("Error while updating assistant");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (assistantId && onClose()) {
            fetchAssistant();
        }
    }, [assistantId]);

    return {
        name,
        setName,
        prompt,
        setPrompt,
        icon,
        setIcon,
        loading,
        handleSave,
    };
};
