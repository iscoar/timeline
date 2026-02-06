import { create } from "zustand";
import type Timeline from "react-calendar-timeline";

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
    start_time: number;
    end_time: number;
    canMove?: boolean;
    canResize?: boolean;
    canChangeGroup?: boolean;
    itemProps?: {
        [k: string]: any;
        style?: React.CSSProperties;
    };
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
    moveItemToNewGroup: (
        itemId: string,
        newGroupId: string,
        tempGroupId: string
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
    setGroups: (groups: TimelineGroup[]) => void;
}

export const useTimelineStore = create<TimelineState>((set, get) => {
    return {
        groups: [{ id: NEW_LANE_ID, title: "Arrastra aquí para crear fila" }],
        items: [],
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

                return { items: newItems };
            }),

        moveItemToNewGroup: (itemId, newGroupId, tempGroupId) =>
            set((state) => {
                const item = state.items.find((i) => i.id === itemId);
                if (!item) return state;

                const tempGroup = state.groups.find((g) => g.id === tempGroupId);
                if (!tempGroup) return state;

                const newGroups = state.groups.map((group) =>
                    group.id === tempGroupId
                        ? { ...group, id: newGroupId }
                        : group
                );

                const newItems = state.items.map((i) =>
                    i.id === itemId
                        ? {
                            ...i,
                            group: newGroupId,
                        }
                        : i
                );

                return { groups: newGroups, items: newItems };
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

                // Persistence handled by controller (Supabase)

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

                return { groups: newGroups };
            });
        },
        setGroups: (groups) => set({ groups }),
    }
});