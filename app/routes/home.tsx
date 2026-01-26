import type { Route } from "./+types/home";
import { TimelineView } from "~/components/task-timeline";
import { TimelineControls } from "~/components/TimelineControls";
import { useTimelineController } from "~/controllers/timelineController";
import { useTask } from "~/hooks/useTask";
import { useTimelineStore } from "~/store/timelineStore";
import { useEffect } from "react";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const { newTaskName, setNewTaskName, startTime, setStartTime, endTime, setEndTime, addTask } = useTask();
  const { handleZoomIn, handleZoomOut, handleSetToday, addItem } = useTimelineController();
  const loadFromStorage = useTimelineStore((s) => s.loadFromStorage);

  // Load data from localStorage on component mount
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const handleAddTask = () => {
    const newItem = addTask();
    if (newItem) {
      // Here you would typically add the new item to your timeline store
      console.log("Nueva tarea agregada:", newItem);
      addItem(newItem);
    }
  }

  return (
    <div className="min-h-screen bg-[#F1F4F9] p-6">
      <div className="max-w-[95vw] mx-auto">
        <TimelineControls
          newTaskName={newTaskName}
          setNewTaskName={setNewTaskName}
          startTime={startTime}
          setStartTime={setStartTime}
          endTime={endTime}
          setEndTime={setEndTime}
          addTask={handleAddTask}
          setZoomIn={handleZoomIn}
          setZoomOut={handleZoomOut}
          setToday={handleSetToday}
        />
        <TimelineView />
      </div>
    </div>
  );
}
