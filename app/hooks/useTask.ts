import { useState } from "react";
import { type  TimelineItem } from "../store/timelineStore";
import dayjs from "dayjs";

export const useTask = () => {
    const [newTaskName, setNewTaskName] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    const addTask = () => {
        if (!newTaskName.trim()) return;
        if (!startTime || !endTime) return;
        if (dayjs(endTime).isBefore(dayjs(startTime))) return;

        setNewTaskName("");
        setStartTime("");
        setEndTime("");
        return {
            id: Date.now()+"",
            group: "lane-1",
            title: newTaskName,
            start_time: dayjs(startTime).valueOf(),
            end_time: dayjs(endTime).valueOf(),
            color: "#3b82f6",
        } as TimelineItem;
    };

    return {
        newTaskName,
        setNewTaskName,
        startTime,
        setStartTime,
        endTime,
        setEndTime,
        addTask,
    };
};
