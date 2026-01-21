import type { TimelineItem } from "../store/timelineStore";

export const hasCollision = (
  moving: TimelineItem,
  items: TimelineItem[]
) => {
  return items.some((item) => {
    if (item.id === moving.id || item.group !== moving.group) return false;

    return !(
      moving.end_time <= item.start_time ||
      moving.start_time >= item.end_time
    );
  });
};

export const snapToMinutes = (timestamp: number, minutes: number) => {
  const ms = minutes * 60 * 1000;
  return Math.round(timestamp / ms) * ms;
};
