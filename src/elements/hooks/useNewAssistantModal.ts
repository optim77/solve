import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { supabase } from "@/superbase/client";

export const useNewAssistantModal = (onClose: () => void, onAdded?: () => void) => {
    const [name, setName] = useState("");
    const [prompt, setPrompt] = useState("");
    const [icon, setIcon] = useState("");
    const [loading, setLoading] = useState(false);
    const { user } = useUser();

    const handleSave = async () => {
        if (!name || !prompt) {
            toast.error("Fill required fields");
            return;
        }
        try {
            setLoading(true);

            const { error } = await supabase.from("user_assistants").insert([
                {
                    name,
                    prompt,
                    icon,
                    assistant_id: name.toLowerCase().replace(/\s+/g, "-"),
                    user: user?.id,
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