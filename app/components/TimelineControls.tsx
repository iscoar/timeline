import { Plus, ZoomIn, ZoomOut, Timer } from "lucide-react";

interface Props {
  newTaskName: string;
  setNewTaskName: (v: string) => void;
  startTime: string;
  setStartTime: (v: string) => void;
  endTime: string;
  setEndTime: (v: string) => void;
  addTask: () => void;
  setZoomIn: () => void;
  setZoomOut: () => void;
  setToday: () => void;
}

export const TimelineControls: React.FC<Props> = ({
  newTaskName,
  setNewTaskName,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  addTask,
  setZoomIn,
  setZoomOut,
  setToday,
}) => {
  return (
    <div className="flex gap-4 flex-wrap">
      <div className="flex-1 flex gap-2">
        <input
          type="text"
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          placeholder="Nombre de la tarea..."
          className="flex-1 px-4 py-3 border-2 bg-white border-gray-200 text-gray-800 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
        />
        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          placeholder="Fecha de inicio..."
          className="flex-1 px-4 py-3 border-2 bg-white border-gray-200 text-gray-800 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
        />
        <input
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          placeholder="Fecha de fin..."
          className="flex-1 px-4 py-3 border-2 bg-white border-gray-200 text-gray-800 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
        />
        <button
          onClick={addTask}
          className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2 font-medium"
        >
          <Plus size={20} />
          Agregar
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setZoomOut()}
          className="p-3 bg-gray-500 rounded-xl hover:bg-gray-600 transition-colors"
        >
          <ZoomOut size={20} />
        </button>

        <button
          onClick={() => setZoomIn()}
          className="p-3 bg-gray-500 rounded-xl hover:bg-gray-600 transition-colors"
        >
          <ZoomIn size={20} />
        </button>

        <button
          onClick={() => setToday()}
          className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors flex items-center gap-2 font-medium"
        >
          <Timer size={20} />
          Ahora
        </button>
      </div>
    </div>
  );
};
