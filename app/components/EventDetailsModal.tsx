import { Check, Edit, Save, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { TimelineItem } from "~/store/timelineStore";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useFocusManagement, useAriaLive } from "~/hooks/useAccessibility";
dayjs.extend(relativeTime);

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: TimelineItem | null;
  groupName?: string;
  onSave: (updatedEvent: TimelineItem) => void;
  onDelete: (eventId: string) => void;
  onFinish: (eventId: string) => void;
}

export const EventDetailsModal = ({ isOpen, onClose, event, groupName, onSave, onDelete, onFinish }: EventDetailsModalProps) => {
  const { containerRef } = useFocusManagement(isOpen);
  const { announcePolite } = useAriaLive();
  const previousEventRef = useRef<TimelineItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(event?.title || "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (event && (!previousEventRef.current || previousEventRef.current.id !== event.id)) {
      announcePolite(`Event details opened: ${event.title}`);
      previousEventRef.current = event;
      setTitle(event.title || "");
      setIsEditing(false);
    }
  }, [event, announcePolite]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        announcePolite('Event details closed');
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose, announcePolite]);

  if (!isOpen || !event) return null;

  const formatTime = (timestamp: number) => {
    return dayjs(timestamp).format("DD MMM YYYY, HH:mm");
  };

  const formatDuration = (start: number, end: number) => {
    const s = dayjs(start);
    const e = dayjs(end);

    let cursor = s;
    const years = e.diff(cursor, "year");
    cursor = cursor.add(years, "year");
    const months = e.diff(cursor, "month");
    cursor = cursor.add(months, "month");
    const days = e.diff(cursor, "day");
    cursor = cursor.add(days, "day");
    const hours = e.diff(cursor, "hour");
    cursor = cursor.add(hours, "hour");
    const minutes = e.diff(cursor, "minute");

    if (years > 0) {
      return `${years}y${months > 0 ? ` ${months}m` : ""}`;
    }
    if (months > 0) {
      return `${months}m${days > 0 ? ` ${days}d` : ""}`;
    }
    if (days > 0) {
      return `${days}d${hours > 0 ? ` ${hours}h` : ""}`;
    }
    if (hours > 0) {
      return `${hours}h${minutes > 0 ? ` ${minutes}m` : ""}`;
    }
    return `${minutes}m`;
  };

  const getStart = (timestamp: number) => {
    const now = dayjs();
    const time = dayjs(timestamp);
    return time.isBefore(now) ? `Hace ${now.to(time, true)}` : `En ${now.to(time, true)}`;
  }

  const getEnd = (timestamp: number) => {
    const now = dayjs();
    const time = dayjs(timestamp);
    return time.isBefore(now) ? `Hace ${now.to(time, true)}` : `En ${now.to(time, true)}`;
  }

  const onEdit = () => {
    setIsEditing(true);
    announcePolite('Event edit mode activated');
  }

  const handleSave = () => {
    if (!event) return;
    const updated = { ...event, title };
    setIsProcessing(true);
    onSave(updated);
    setIsEditing(false);
    announcePolite('Event changes saved');
    setIsProcessing(false);
  }

  const handleFinish = () => {
    setIsProcessing(true);
    announcePolite('Event marked as completed');
    onFinish(event.id);
    setIsProcessing(false);
  }

  const handleDelete = () => {
    // show confirmation inside modal
    setConfirmDelete(true);
  }

  const confirmDeleteNow = async () => {
    if (!event) return;
    setIsProcessing(true);
    announcePolite('Deleting event');
    await onDelete(event.id);
    setIsProcessing(false);
    setConfirmDelete(false);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-100"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-details-title"
      aria-describedby="event-details-description"
    >
      <div
        ref={containerRef}
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2
            id="event-details-title"
            className="text-xl font-semibold text-gray-900"
          >
            Detalles del Evento
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close event details"
            title="Close dialog (Escape)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex justify-end gap-2 px-6 border-t bg-gray-50 rounded-b-lg">
          {confirmDelete ? (
            <>
              <button
                onClick={confirmDeleteNow}
                disabled={isProcessing}
                className="flex items-center px-4 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                {isProcessing ? 'Eliminando...' : 'Confirmar eliminación'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={isProcessing}
                className="flex items-center px-4 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-4 h-4 mr-1" />
                Cancelar
                </button>
            </>
          ) : (
            <>
              {isEditing ? (
                <button
                  onClick={handleSave}
                  disabled={isProcessing}
                  className="flex items-center px-4 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Save event details"
                >
                  <Save className="w-4 h-4 mr-1" />
                  {isProcessing ? 'Guardando...' : 'Guardar'}
                </button>
              ) : (
                <button
                  onClick={onEdit}
                  className="flex items-center px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                  aria-label="Edit event details"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </button>
              )}

              <button
                onClick={() => { setIsProcessing(true); handleFinish(); setIsProcessing(false); }}
                disabled={isProcessing}
                className="flex items-center px-4 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Close event details dialog"
              >
                <Check className="w-4 h-4 mr-1" />
                Terminar tarea
              </button>

              <button
                onClick={handleDelete}
                disabled={isProcessing}
                className="flex items-center px-4 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Delete event"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Eliminar
              </button>
            </>
          )}
        </div>
        <div
          id="event-details-description"
          className="p-6 space-y-4"
        >
          <div>
            <label
              id="event-title-label"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Título
            </label>
            <input
              type="text"
              id="event-title"
              name="event-title"
              placeholder="Título del evento"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={!isEditing}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mt-1 leading-tight focus:outline-none focus:shadow-outline disabled:bg-gray-100 disabled:text-gray-500"
              aria-labelledby="event-title-label"
              required
            />
          </div>

          <div>
            <label
              id="event-category-label"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Categoría
            </label>
            <p
              className="text-gray-900"
              aria-labelledby="event-category-label"
            >
              {groupName || "Sin categoría"}
            </p>
          </div>

          <div>
            <label
              id="event-start-label"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Inicio - <span className="text-gray-700 text-sm">{getStart(event.start_time)}</span>
            </label>
            <p
              className="text-gray-900"
              aria-labelledby="event-start-label"
            >
              {formatTime(event.start_time)}
            </p>
          </div>

          <div>
            <label
              id="event-end-label"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Fin - <span className="text-gray-700 text-sm">{getEnd(event.end_time)}</span>
            </label>
            <p
              className="text-gray-900"
              aria-labelledby="event-end-label"
            >
              {formatTime(event.end_time)}
            </p>
          </div>

          <div>
            <label
              id="event-duration-label"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Duración
            </label>
            <p
              className="text-gray-900"
              aria-labelledby="event-duration-label"
            >
              {formatDuration(event.start_time, event.end_time)}
            </p>
          </div>
        </div>

        <div className="flex justify-end p-6 border-t bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Close event details dialog"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};