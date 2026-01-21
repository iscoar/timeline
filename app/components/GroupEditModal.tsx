import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { type TimelineGroup } from "~/store/timelineStore";
import { useFocusManagement, useAriaLive } from "~/hooks/useAccessibility";

interface GroupEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: TimelineGroup | null;
  onSave: (groupId: string, newTitle: string) => void;
}

export const GroupEditModal = ({ isOpen, onClose, group, onSave }: GroupEditModalProps) => {
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { containerRef } = useFocusManagement(isOpen);
  const { announcePolite } = useAriaLive();

  useEffect(() => {
    setTitle(group?.title || "");
  }, [group?.id]);

  useEffect(() => {
    if (isOpen && group) {
      announcePolite(`Editing group: ${group.title}`);
    }
  }, [isOpen, group, announcePolite]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        handleClose();
        announcePolite('Group edit cancelled');
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isSubmitting, announcePolite]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!group || !title.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      await onSave(group.id, title.trim());
      announcePolite(`Group saved: ${title.trim()}`);
      onClose();
    } catch (error) {
      console.error("Error saving group:", error);
      announcePolite('Error saving group');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setTitle(group?.title || "");
      onClose();
      announcePolite('Group edit cancelled');
    }
  };

  if (!isOpen || !group) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-100"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="group-edit-title"
      aria-describedby="group-edit-description"
    >
      <div 
        ref={containerRef}
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 
            id="group-edit-title"
            className="text-xl font-semibold text-gray-900"
          >
            Editar Grupo
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close group edit dialog"
            title="Close dialog (Escape)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form 
          id="group-edit-form" 
          onSubmit={handleSubmit} 
          className="p-6 space-y-4"
          aria-describedby="group-edit-description"
        >
          <div id="group-edit-description" className="sr-only">
            Edit the group title for your timeline tasks.
          </div>
          
          <div>
            <label 
              htmlFor="group-title" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Título del Grupo
            </label>
            <input
              id="group-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ingrese el título del grupo"
              className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
              required
              aria-required="true"
              aria-describedby="group-id-display"
              autoComplete="off"
            />
          </div>
          
          <div 
            id="group-id-display"
            className="text-sm text-gray-500"
            aria-live="polite"
          >
            <p>ID del grupo: <code className="bg-gray-100 px-1 py-0.5 rounded">{group.id}</code></p>
          </div>
        </form>
        
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50 rounded-b-lg">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Cancel group edit"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="group-edit-form"
            disabled={isSubmitting || !title.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label={isSubmitting ? "Saving group" : "Save group"}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
};