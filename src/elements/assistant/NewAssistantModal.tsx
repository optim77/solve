import { useState } from "react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { useNewAssistantModal } from "@/elements/assistant/hooks/useNewAssistantModal";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExamplePrompts } from "@/ExamplePrompts";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onAdded?: () => void;
}

export const AddAssistantModal = ({isOpen, onClose, onAdded}: Props) => {
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

                <Dialog>
                    <DialogTrigger>
                        <Button className='mb-3'>See inspirations</Button>
                    </DialogTrigger>
                    <DialogContent className=" p-4">
                        <DialogHeader>
                            <DialogTitle>Inspirations</DialogTitle>
                            <DialogDescription>
                                <Tabs defaultValue="expert">
                                    <TabsList className="flex-wrap max-w-full overflow-x-auto">
                                        {Array.from(ExamplePrompts.keys()).map((key) => (
                                            <TabsTrigger key={key} value={key} className="capitalize">
                                                {key}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>

                                    <div className="mt-4 max-h-[110vh] overflow-auto">
                                        {Array.from(ExamplePrompts.entries()).map(([key, value]) => (
                                            <TabsContent key={key} value={key}>
                                                <div className="space-y-2">
                                                    <p className="font-semibold">Prompt:</p>
                                                    <div className="relative">
                                                        <pre className="whitespace-pre-wrap rounded-lg bg-muted p-10 text-sm font-mono">
                                                          {value}
                                                        </pre>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="absolute top-2 right-2"
                                                            onClick={() => navigator.clipboard.writeText(value)}
                                                        >
                                                            Copy
                                                        </Button>
                                                    </div>
                                                </div>
                                            </TabsContent>
                                        ))}
                                    </div>
                                </Tabs>
                            </DialogDescription>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>



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
