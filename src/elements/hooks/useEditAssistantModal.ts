import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { supabase } from "@/superbase/client";

export const useEditAssistantModal = (
    assistantId: string | null,
    onClose: () => void,
    onEdited?: () => void
) => {
    const [name, setName] = useState("");
    const [prompt, setPrompt] = useState("");
    const [icon, setIcon] = useState("");
    const [loading, setLoading] = useState(false);
    const { user } = useUser();

    const fetchAssistant = async () => {
        if (!assistantId || !user) return;

        const { data, error } = await supabase
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
        if (!name || !prompt) {
            toast.error("Fill required fields");
            return;
        }
        try {
            setLoading(true);

            const { error } = await supabase
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
        if (assistantId && onClose) {
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
