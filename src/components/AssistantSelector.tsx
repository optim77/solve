import { AssistantButton } from "@/elements/assistant/AssistantButton";
import { NewAssistantButton } from "@/elements/assistant/NewAssistantButton";
import { EditAssistantModal } from "@/elements/assistant/EditAssistantModal";

import { Assistant, useAssistant } from "@/elements/assistant/hooks/useAssistant";
import { Separator } from "@/components/ui/separator";

interface Props {
    selected?: string;
    onSelect: (assistant: Assistant) => void;
}

export default function AssistantSelector({ selected, onSelect }: Props) {
    const {
        loading,
        editAssistant,
        isEditOpen,
        memoizedAssistants,
        memoizedPublicAssistants,
        handleEdit,
        fetchAssistants,
        setIsEditOpen
    } = useAssistant(selected);

    return (
        <div className="flex flex-col justify-between gap-2 p-3 w-80 fixed right-0 top-0 h-full overflow-y-auto">
            <div className="flex flex-col gap-2">
                {loading && (
                    <div className="flex justify-center items-center h-full">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {!loading && <NewAssistantButton onAdded={fetchAssistants} />}

                {!loading && memoizedAssistants.length === 0 && (
                    <p className="text-gray-400 text-sm text-center">No assistants yet</p>
                )}

                {memoizedAssistants.map((assistant) => (
                    <AssistantButton
                        key={assistant.id}
                        assistant={assistant}
                        onSelect={onSelect}
                        isActive={assistant.isActive}
                        onEdit={handleEdit}
                    />
                ))}
            </div>

            <div className="flex flex-col gap-2">
                <Separator />
                {memoizedPublicAssistants.map((assistant: Assistant) => (
                    <AssistantButton
                        key={assistant.id}
                        assistant={assistant}
                        onSelect={onSelect}
                        isActive={assistant.isActive}
                    />
                ))}
            </div>

            {editAssistant && (
                <EditAssistantModal
                    assistantId={editAssistant.id}
                    isOpen={isEditOpen}
                    onClose={() => setIsEditOpen(false)}
                    onEdited={fetchAssistants}
                />
            )}
        </div>
    );
}