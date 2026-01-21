import { useCallback } from "react";
import dayjs from "dayjs";
import { NEW_LANE_ID, useTimelineStore, type TimelineItem } from "../store/timelineStore";
type ResizeEdge = "left" | "right";

export const useTimelineController = () => {
    const items = useTimelineStore((s) => s.items);
    const { groups, timelineRef, moveItemToGroup, resizeItem, createGroup } =
        useTimelineStore();

    const handleItemMove = (
        itemId: string,
        dragTime: number,
        newGroupOrder: number
    ) => {
        const targetGroup = groups[newGroupOrder];

        if (!targetGroup) return;

        if (targetGroup.id === NEW_LANE_ID) {
            const newGroupId = createGroup(`lane-${groups.length}`);
            moveItemToGroup(itemId, newGroupId, dragTime);
        } else {
            moveItemToGroup(itemId, targetGroup.id, dragTime);
        }
    };

    const handleItemResize = (
        itemId: string,
        newTime: number,
        edge: ResizeEdge
    ) => {
        resizeItem(itemId, newTime, edge);
    };

    const handleItemSelect = useCallback((itemId: string) => {
        console.log("Seleccionado:", itemId);
    }, []);

    const handleZoomIn = () => {
        if (timelineRef.current) {
            // Zoom in: a factor < 1 zooms in
            timelineRef.current.changeZoom(0.75);
        }
    };

    const handleZoomOut = () => {
        if (timelineRef.current) {
            // Zoom out: a factor > 1 zooms out
            timelineRef.current.changeZoom(1.25);
        }
    };

    const handleSetToday = () => {
        if (timelineRef.current) {
            const now = dayjs();
            const start = now.set('hour', 0).set('minute', 0).set('second', 0);
            const end = dayjs(start).add(1, 'day');
            timelineRef.current.showPeriod(start, end);
        }
    };

const addItem = (item: TimelineItem) => {
        const newItems = [...items, item];
        useTimelineStore.getState().setItems(newItems);
    }

    return {
        items,
        timelineRef,
        handleItemMove,
        handleItemResize,
        handleItemSelect,
        handleZoomIn,
        handleZoomOut,
        handleSetToday,
        addItem,
    };
};
