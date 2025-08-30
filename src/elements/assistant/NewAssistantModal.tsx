import { useState } from "react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { useNewAssistantModal } from "@/elements/assistant/hooks/useNewAssistantModal";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onAdded?: () => void;
}

export const AddAssistantModal = ({ isOpen, onClose, onAdded }: Props) => {
    const {
        name,
        setName,
        prompt,
        setPrompt,
        icon,
        setIcon,
        handleSave,
        loading,
        models,
        selectedModel,
        setSelectedModel
    } = useNewAssistantModal(onClose, onAdded);

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* Modal content */}
            <div
                className="relative border rounded-2xl shadow-lg w-full max-w-md p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 cursor-pointer"
                >
                    ✕
                </button>

                <h2 className="text-xl font-semibold text-white mb-4">
                    Add a new assistant
                </h2>

                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Assistant name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2 rounded-lg border text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <textarea
                        placeholder="Prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full p-2 rounded-lg border border-gray-700 text-white min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Icon (emoji)"
                            value={icon}
                            onChange={(e) => setIcon(e.target.value)}
                            className="flex-1 p-2 rounded-lg border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="px-3 py-2 hover:bg-gray-600 rounded-lg text-white"
                        >
                            😀
                        </button>
                    </div>

                    <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="w-full p-2 rounded-lg bg-black border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {models.map((model) => (
                            <option key={model} value={model}>
                                {model}
                            </option>
                        ))}
                    </select>

                    {showEmojiPicker && (
                        <div className="mt-2">
                            <EmojiPicker
                                theme={Theme.DARK}
                                onEmojiClick={(emojiData: EmojiClickData) => {
                                    setIcon(emojiData.emoji);
                                    setShowEmojiPicker(false);
                                }}
                            />
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Add"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
