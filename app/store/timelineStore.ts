import { create } from "zustand";
import type Timeline from "react-calendar-timeline";
import { localStorageService } from "../services/localStorageService";

type ResizeEdge = "left" | "right";

export const NEW_LANE_ID = "__new_lane__";

export interface TimelineGroup {
    id: string;
    title: string;
}

export interface TimelineItem {
    id: string;
    group: string;
    title: string;
    start_time: number; // SIEMPRE en ms
    end_time: number;   // SIEMPRE en ms
    color?: string;
}

interface TimelineState {
    groups: TimelineGroup[];
    items: TimelineItem[];
    timelineRef: React.RefObject<Timeline | null>;

    updateItem: (
        id: string,
        partial: Partial<Omit<TimelineItem, "id">>
    ) => void;

    setItems: (items: TimelineItem[]) => void;
    moveItemToGroup: (
        itemId: string,
        newGroupId: string,
        newStart: number
    ) => void;
    resizeItem: (itemId: string, newTime: number, edge: ResizeEdge) => void;

    hasCollision: (
        itemId: string,
        groupId: string,
        newStart: number,
        newEnd: number
    ) => boolean;

    createGroup: (title?: string) => string;
    updateGroup: (groupId: string, newTitle: string) => void;

    // localStorage methods
    loadFromStorage: () => void;
    saveToStorage: () => void;
}

export const useTimelineStore = create<TimelineState>((set, get) => {
    // Default groups
    const defaultGroups = [
        { id: "lane-1", title: "Proyectos" },
        { id: "lane-2", title: "Tareas" },
        { id: "lane-3", title: "Objetivos" },
        { id: NEW_LANE_ID, title: "Arrastra aquí para crear fila" },
    ];

    // Default items (sample data)
    const defaultItems = [
        {
            id: "1",
            group: "lane-1",
            title: "Estudiar",
            start_time: Date.now(),
            end_time: Date.now() + 2 * 60 * 60 * 1000, // 2 horas
            color: "#3b82f6",
        },
        {
            id: "2",
            group: "lane-2",
            title: "Descanso",
            start_time: Date.now() + 2 * 60 * 60 * 1000,
            end_time: Date.now() + 2.5 * 60 * 60 * 1000,
            color: "#10b981",
        },
        {
            id: "3",
            group: "lane-3",
            title: "Ejercicio",
            start_time: Date.now() + 2.5 * 60 * 60 * 1000,
            end_time: Date.now() + 3 * 60 * 60 * 1000,
            color: "#f59e0b",
        },
    ];

    // Load from localStorage or use defaults
    const storedGroups = localStorageService.loadGroups();
    const storedItems = localStorageService.loadItems();

    return {
        groups: storedGroups || defaultGroups,
        items: storedItems.length > 0 ? storedItems : defaultItems,
        timelineRef: { current: null },

        updateItem: (id, partial) =>
            set((state) => {
                const newItems = state.items.map((item) =>
                    item.id === id ? { ...item, ...partial } : item
                );
                return { items: newItems };
            }),

        setItems: (items) => {
            set({ items });
            // Save to localStorage when items are set
            setTimeout(() => get().saveToStorage(), 0);
        },

        moveItemToGroup: (itemId, newGroupId, newStart) =>
            set((state) => {
                if (newGroupId === NEW_LANE_ID) return state;
                const item = state.items.find((i) => i.id === itemId);
                if (!item) return state;

                const duration = item.end_time - item.start_time;
                const newEnd = newStart + duration;

                if (get().hasCollision(itemId, newGroupId, newStart, newEnd)) {
                    return state;
                }

                const newItems = state.items.map((i) =>
                    i.id === itemId
                        ? {
                            ...i,
                            group: newGroupId,
                            start_time: newStart,
                            end_time: newEnd,
                        }
                        : i
                );

                // Save to localStorage after move
                setTimeout(() => get().saveToStorage(), 0);

                return { items: newItems };
            }),

        resizeItem: (itemId, newTime, edge) =>
            set((state) => {
                const item = state.items.find((i) => i.id === itemId);
                if (!item) return state;

                let newStart = item.start_time;
                let newEnd = item.end_time;

                if (edge === "left") {
                    newStart = newTime;
                } else {
                    newEnd = newTime;
                }

                if (
                    get().hasCollision(
                        itemId,
                        item.group,
                        newStart,
                        newEnd
                    )
                ) {
                    return state;
                }

                const newItems = state.items.map((i) =>
                    i.id === itemId
                        ? { ...i, start_time: newStart, end_time: newEnd }
                        : i
                );

                // Save to localStorage after resize
                setTimeout(() => get().saveToStorage(), 0);

                return { items: newItems };
            }),

        hasCollision: (itemId, groupId, newStart, newEnd) => {
            const { items } = get();

            return items.some((item) => {
                if (item.id === itemId) return false;
                if (item.group !== groupId) return false;

                const overlaps =
                    newStart < item.end_time && newEnd > item.start_time;

                return overlaps;
            });
        },

        createGroup: (title = "Nuevo carril") => {
            const newId = `group-${Date.now()}`;

            set((state) => {
                const newGroups = [
                    ...state.groups,
                    { id: newId, title },
                ].sort((a, b) => (a.id === NEW_LANE_ID ? 1 : b.id === NEW_LANE_ID ? -1 : 0));

                // Save to localStorage after group creation
                setTimeout(() => get().saveToStorage(), 0);

                return { groups: newGroups };
            });

            return newId;
        },

        updateGroup: (groupId, newTitle) => {
            set((state) => {
                // Don't allow editing the special new lane group
                if (groupId === NEW_LANE_ID) return state;

                const newGroups = state.groups.map((group) =>
                    group.id === groupId ? { ...group, title: newTitle } : group
                );

                // Save to localStorage after group update
                setTimeout(() => get().saveToStorage(), 0);

                return { groups: newGroups };
            });
        },

        loadFromStorage: () => {
            const storedItems = localStorageService.loadItems();
            const storedGroups = localStorageService.loadGroups();

            if (storedItems.length > 0) {
                set({ items: storedItems });
            }
            if (storedGroups) {
                set({ groups: storedGroups });
            }
        },

        saveToStorage: () => {
            const { items, groups } = get();
            localStorageService.saveItems(items);
            localStorageService.saveGroups(groups);
        },
    }
});