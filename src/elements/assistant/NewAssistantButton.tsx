"use client";

import { useState } from "react";
import { AddAssistantModal } from "@/elements/assistant/NewAssistantModal";
import { BadgePlus } from "lucide-react";

interface Props {
    onAdded?: () => void;
}

export const NewAssistantButton = ({ onAdded }: Props) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center justify-center gap-2 p-2 rounded-lg transition-all duration-200     border border-gray-700 hover:border-blue-400"
            >
                <BadgePlus />
            </button>

            <AddAssistantModal isOpen={isOpen} onClose={() => setIsOpen(false)} onAdded={onAdded} />
        </>
    );
};
