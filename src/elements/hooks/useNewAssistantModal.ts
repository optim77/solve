import { useState } from "react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/superbase/client";
import { useSupabaseUser } from "@/components/superbase/SupabaseUserProvider";


export const useNewAssistantModal = (onClose: () => void, onAdded?: () => void) => {
    const [name, setName] = useState("");
    const [prompt, setPrompt] = useState("");
    const [icon, setIcon] = useState("");
    const [loading, setLoading] = useState(false);
    const { user } = useSupabaseUser();

    const handleSave = async () => {
        if (!name || !prompt) {
            toast.error("Fill required fields");
            return;
        }
        try {
            setLoading(true);

            const { error } = await createClient().from("user_assistants").insert([
                {
                    name,
                    prompt,
                    icon,
                    user_id: user?.id,
                },
            ]);

            if (error) throw error;

            toast.success("Assistant added successfully");
            setName("");
            setPrompt("");
            setIcon("");
            onAdded && onAdded();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error("Error while adding assistant");
        } finally {
            setLoading(false);
        }
    };

    return { name, setName, prompt, setPrompt, icon, setIcon, handleSave, loading };
}