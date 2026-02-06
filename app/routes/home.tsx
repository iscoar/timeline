import type { Route } from "./+types/home";
import { TimelineView } from "~/components/TimelineView";
import { TimelineControls } from "~/components/TimelineControls";
import { useTimeline } from "~/hooks/useTimeline";
import { useTask } from "~/hooks/useTask";
import { useEffect } from "react";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Timeline App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const { newTaskName, setNewTaskName, startTime, setStartTime, endTime, setEndTime, isSaving, setIsSaving, addTask } = useTask();
  const { handleZoomIn, handleZoomOut, handleSetToday, addItem, loadInitialData, loading } = useTimeline();

  // Load data from Supabase on component mount
  useEffect(() => {
    loadInitialData().catch((err) => console.error('Failed loading timeline', err));
  }, [loadInitialData]);

  const handleAddTask = async () => {
    setIsSaving(true);
    const newItem = addTask();
    if (newItem) {
      // Here you would typically add the new item to your timeline store
      console.log("Nueva tarea agregada:", newItem);
      await addItem(newItem);
      setIsSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-[#F1F4F9] min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-500">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#F1F4F9]">
      <div className="max-w-[95vw] mx-auto">
        <TimelineControls
          newTaskName={newTaskName}
          setNewTaskName={setNewTaskName}
          startTime={startTime}
          setStartTime={setStartTime}
          endTime={endTime}
          setEndTime={setEndTime}
          addTask={handleAddTask}
          isSaving={isSaving}
          setZoomIn={handleZoomIn}
          setZoomOut={handleZoomOut}
          setToday={handleSetToday}
        />
        <TimelineView />
      </div>
    </div>
  );
}
