import { AssistantButton } from "@/elements/AssistantButton";
import { NewAssistantButton } from "@/elements/NewAssistantButton";
import { EditAssistantModal } from "@/elements/EditAssistantModal";

import { useAssistant } from "@/elements/hooks/useAssistant";

interface Props {
    selected: string;
    onSelect: (id: string) => void;
}



export default function AssistantSelector({ selected, onSelect }: Props) {
    const {
        loading,
        editId,
        isEditOpen,
        memoizedAssistants,
        handleEdit,
        fetchAssistants,
        setIsEditOpen
    } = useAssistant(selected);

    return (
        <div className="flex flex-col gap-2 p-3 rounded-lg w-80 fixed right-0 top-0 h-full overflow-y-auto">
            {loading && <p className="text-gray-400 text-sm">Loading assistants...</p>}

            {!loading && memoizedAssistants.length === 0 && (
                <p className="text-gray-400 text-sm">No assistants yet</p>
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
