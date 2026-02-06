import { useCallback, useState } from "react";
import dayjs from "dayjs";
import { NEW_LANE_ID, useTimelineStore, type TimelineGroup, type TimelineItem } from "../store/timelineStore";
import supabase from "~/services/supabaseService";
import useAuthStore from "~/store/authStore";
type ResizeEdge = "left" | "right";

export interface TaskItem {
    id: number;
    group_id: number;
    title: string;
    start_time: string;
    end_time: string;
    is_completed: boolean;
}

export interface GroupItem {
    id: number;
    title: string;
}

export const useTimeline = () => {
    const { user } = useAuthStore();
    const { items, groups, timelineRef, moveItemToGroup, moveItemToNewGroup, resizeItem, createGroup } =
        useTimelineStore();
    const [loading, setLoading] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

    const formatDate = (timestamp: number) => {
        return dayjs(timestamp).format("YYYY-MM-DD HH:mm");
    };

    const handleItemMove = async (
        itemId: string,
        dragTime: number,
        newGroupOrder: number
    ) => {
        const state = useTimelineStore.getState();
        const currentItems = state.items;
        const currentGroups = state.groups;
        const currentGroupId = currentItems.find((i) => i.id === itemId)?.group;
        const targetGroup = currentGroups[newGroupOrder];

        if (!targetGroup) return;

        let finalGroupId = targetGroup.id;
        if (targetGroup.id === NEW_LANE_ID) {
            const titleGroup = `Categoría ${groups.length}`;
            const tempGroupId = createGroup(titleGroup);
            moveItemToGroup(itemId, tempGroupId, dragTime);

            const { data, error } = await supabase
                .from("groups")
                .insert({
                    title: titleGroup,
                    user_id: user?.id,
                })
                .select('id, title');

            const createdGroup: GroupItem | undefined = data?.[0];
            let newGroupId = tempGroupId;
            if (createdGroup) {
                newGroupId = String(createdGroup.id);
                moveItemToNewGroup(itemId, newGroupId, tempGroupId);
            } else {
                // If group creation failed, move back to original group
                if (currentGroupId) {
                    moveItemToGroup(itemId, currentGroupId, dragTime);
                }
            }

            finalGroupId = newGroupId;
        } else {
            moveItemToGroup(itemId, targetGroup.id, dragTime);
        }

        try {
            const item = state.items.find((i) => i.id === itemId);
            if (!item) return;

            const duration = item.end_time - item.start_time;
            const newEnd = dragTime + duration;

            await supabase
                .from('tasks')
                .update({
                    group_id: Number(finalGroupId),
                    start_time: formatDate(dragTime),
                    end_time: formatDate(newEnd),
                })
                .eq('id', Number(itemId));
        } catch (e) {
            console.error('Failed to persist moved task', e);
        }
    };

    const handleItemResize = async (
        itemId: string,
        newTime: number,
        edge: ResizeEdge
    ) => {
        resizeItem(itemId, newTime, edge);

        try {
            const state = useTimelineStore.getState();
            const item = state.items.find((i) => i.id === itemId);
            if (!item) return;

            let newStart = item.start_time;
            let newEnd = item.end_time;

            if (edge === 'left') {
                newStart = newTime;
            } else {
                newEnd = newTime;
            }

            await supabase
                .from('tasks')
                .update({
                    start_time: formatDate(newStart),
                    end_time: formatDate(newEnd),
                })
                .eq('id', Number(itemId));
        } catch (e) {
            console.error('Failed to persist resized task', e);
        }
    };

    const handleItemSelect = useCallback((itemId: string) => {
        setSelectedItemId(itemId);
        const state = useTimelineStore.getState();
        useTimelineStore.setState({
            items: state.items.map((item) => item.id == itemId ? {
                ...item, itemProps: {
                    ...item.itemProps,
                    style: {
                        ...item.itemProps?.style,
                        background: '#FFC107',
                    }
                }
            } : {
                ...item, itemProps: {
                    ...item.itemProps,
                    style: {
                        ...item.itemProps?.style,
                        background: item.itemProps?.is_completed ? '#4CAF50' : '#00A0FE',
                    }
                }
            })
        });
    }, []);

    const handleItemDeselect = useCallback(() => {
        setSelectedItemId(null);
        const state = useTimelineStore.getState();
        useTimelineStore.setState({
            items: state.items.map((item) => ({
                ...item,
                itemProps: {
                    ...item.itemProps,
                    style: {
                        ...item.itemProps?.style,
                        background: item.itemProps?.is_completed ? '#4CAF50' : '#00A0FE',
                    },
                },
            })),
        });
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

    const addItem = async (item: TimelineItem) => {
        let groupId = item.group;
        if (groups.length === 1 && item.group === 'lane-1') {
            groupId = await addGroup() || item.group;
        } else {
            groupId = groups[0]?.id || item.group;
        }
        const supabaseResponse = await supabase
            .from("tasks")
            .insert({
                title: item.title,
                start_time: formatDate(item.start_time),
                end_time: formatDate(item.end_time),
                group_id: Number(groupId),
                user_id: user?.id,
            })
            .select('title, start_time, end_time, group_id, id');

        const created = supabaseResponse.data?.[0];
        const newItem: TimelineItem = {
            ...item,
            id: String(created?.id ?? item.id),
            group: String(created?.group_id ?? groupId),
            start_time: created?.start_time ? dayjs(created.start_time).valueOf() : item.start_time,
            end_time: created?.end_time ? dayjs(created.end_time).valueOf() : item.end_time,
        };

        const currentItems = useTimelineStore.getState().items;
        const newItems: TimelineItem[] = [...currentItems, newItem];
        useTimelineStore.getState().setItems(newItems);
    }

    const addGroup = async (title = 'Nuevo carril') => {
        try {
            const { data, error } = await supabase
                .from('groups')
                .insert({ title, user_id: user?.id })
                .select('id, title');

            const created: GroupItem | undefined = data?.[0];
            if (created) {
                const currentGroups = useTimelineStore.getState().groups;
                const withoutPlaceholder = currentGroups.filter((g) => g.id !== NEW_LANE_ID);
                const placeholder = currentGroups.find((g) => g.id === NEW_LANE_ID) || { id: NEW_LANE_ID, title: 'Arrastra aquí para crear fila' };
                const newGroupObj: TimelineGroup = { id: String(created.id), title: created.title };
                useTimelineStore.getState().setGroups([...withoutPlaceholder, newGroupObj, placeholder]);
                return String(created.id);
            }
        } catch (e) {
            console.error('Failed creating group', e);
        }

        return null;
    };

    const updateGroup = async (groupId: string, newTitle: string) => {
        try {
            await supabase
                .from('groups')
                .update({ title: newTitle })
                .eq('id', Number(groupId));

            const currentGroups = useTimelineStore.getState().groups;
            const newGroups = currentGroups.map((g) => (g.id === groupId ? { ...g, title: newTitle } : g));
            useTimelineStore.getState().setGroups(newGroups);
        } catch (e) {
            console.error('Failed updating group', e);
        }
    };

    const loadInitialData = useCallback(async () => {
        if (!user) return;

        setLoading(true);
        const { data: groupsData, error: groupsError } = await supabase
            .from('groups')
            .select('id, title')
            .eq('user_id', user.id)
            .order('id', { ascending: true });

        if (groupsData) {
            const mappedGroups: TimelineGroup[] = groupsData.map((g: GroupItem) => ({ id: String(g.id), title: g.title }));
            // Always keep the NEW_LANE_ID placeholder at the end
            useTimelineStore.getState().setGroups([...mappedGroups, { id: NEW_LANE_ID, title: 'Arrastra aquí para crear fila' }]);
        }

        const { data: tasksData, error: tasksError } = await supabase
            .from('tasks')
            .select('id, group_id, title, start_time, end_time, is_completed')
            .eq('user_id', user.id)
            .order('start_time', { ascending: true });

        if (tasksData) {
            const mappedItems: TimelineItem[] = tasksData.map((t: TaskItem) => ({
                id: String(t.id),
                group: String(t.group_id),
                title: t.title,
                start_time: dayjs(t.start_time).valueOf(),
                end_time: dayjs(t.end_time).valueOf(),
                canMove: !t.is_completed,
                canResize: !t.is_completed,
                canChangeGroup: !t.is_completed,
                itemProps: {
                    style: {
                        background: t.is_completed ? '#4CAF50' : '#00A0FE',
                    },
                    is_completed: t.is_completed,
                }
            }));

            useTimelineStore.getState().setItems(mappedItems);
        }
        setLoading(false);
    }, [user]);

    return {
        items,
        timelineRef,
        handleItemMove,
        handleItemResize,
        handleItemSelect,
        handleItemDeselect,
        handleZoomIn,
        handleZoomOut,
        handleSetToday,
        addItem,
        addGroup,
        updateGroup,
        loadInitialData,
        loading,
        selectedItemId,
    };
};
