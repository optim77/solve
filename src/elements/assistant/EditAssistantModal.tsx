"use client";

import { useEditAssistantModal } from "@/elements/assistant/hooks/useEditAssistantModal";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { useState } from "react";

interface Props {
    assistantId: string;
    isOpen: boolean;
    onClose: () => void;
    onEdited?: () => void;
}

export const EditAssistantModal = ({
                                       assistantId,
                                       isOpen,
                                       onClose,
                                       onEdited,
                                   }: Props) => {
    const {
        name,
        setName,
        prompt,
        setPrompt,
        icon,
        setIcon,
        loading,
        handleSave,
        handleDelete
    } = useEditAssistantModal(assistantId, onClose, onEdited);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black bg-opacity-60"
                onClick={onClose}
            ></div>

            <div className="relative z-10 w-full max-w-md p-6 bg-gray-900 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold text-white mb-4">
                    Edit assistant
                </h2>

                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Assistant name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
                    />

                    <textarea
                        placeholder="Prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white min-h-[100px]"
                    />

                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Icon (emoji)"
                            value={icon}
                            onChange={(e) => setIcon(e.target.value)}
                            className="flex-1 p-2 rounded bg-gray-800 border border-gray-700 text-white"
                        />
                        <button
                            type="button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
                        >
                            😀
                        </button>
                    </div>

                    {showEmojiPicker && (
                        <div className="mt-2">
                            <EmojiPicker
                                onEmojiClick={(emojiData: EmojiClickData) => {
                                    setIcon(emojiData.emoji);
                                    setShowEmojiPicker(false);
                                }}
                            />
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 text-white disabled:opacity-50"
                        >
                            Delete
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
