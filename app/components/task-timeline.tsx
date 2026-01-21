import { useCallback, useState } from "react";
import dayjs from "dayjs";
import Timeline, { TodayMarker, type Id } from "react-calendar-timeline";
import { GroupEditModal } from "./GroupEditModal";
import { errorLogger } from "~/services/errorLogger";
import { EventDetailsModal } from "./EventDetailsModal";
import { useTimelineController } from "~/controllers/timelineController";
import { type TimelineGroup, useTimelineStore } from "~/store/timelineStore";
import { TaskOperationErrorBoundary, TimelineErrorBoundary } from "./TimelineErrorBoundary";

import "dayjs/locale/es";
import "react-calendar-timeline/style.css";
import "~/styles/timeline.tailwind.css";

export const TimelineView = () => {
  const groups = useTimelineStore((s) => s.groups);
  const { items, timelineRef, handleItemMove, handleItemResize, handleItemSelect } =
    useTimelineController();
  const updateGroup = useTimelineStore((s) => s.updateGroup);

  const handleTimelineError = useCallback((error: Error) => {
    errorLogger.log(error, {
      severity: 'high',
      context: {
        componentName: 'TimelineView',
        action: 'timeline_render'
      }
    });
  }, []);

  const handleTaskError = useCallback((error: Error) => {
    errorLogger.log(error, {
      severity: 'medium',
      context: {
        componentName: 'TimelineView',
        action: 'task_operation'
      }
    });
  }, []);

  const [visibleTime, setVisibleTime] = useState(() => ({
    start: dayjs().add(-1, "hour").valueOf(),
    end: dayjs().add(6, "hour").valueOf(),
  }));

  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<TimelineGroup | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  const handleItemDoubleClick = (itemId: number | string) => {
    const eventId = String(itemId);
    setSelectedEvent(eventId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleGroupClick = (e: React.MouseEvent, groupId: Id) => {
    e.stopPropagation();
    const group = groups.find((g) => g.id === groupId);
    setSelectedGroup(group || null);
    setIsGroupModalOpen(true);
  };

  const handleCloseGroupModal = () => {
    setIsGroupModalOpen(false);
    setSelectedGroup(null);
  };

  const handleSaveGroup = async (groupId: string, newTitle: string) => {
    try {
      updateGroup(groupId, newTitle);
    } catch (error) {
      errorLogger.log({
        name: 'GroupSaveError',
        message: error instanceof Error ? error.message : 'Unknown error saving group',
        stack: error instanceof Error ? error.stack : undefined
      }, {
        severity: 'medium',
        context: {
          componentName: 'TimelineView',
          action: 'save_group',
          additionalData: { groupId, newTitle }
        }
      });
    }
  };

  const selectedEventItem = items.find(item => item.id === selectedEvent);
  const selectedEventGroup = groups.find(group => group.id === selectedEventItem?.group);

  return (
    <div style={{ height: "650px", padding: "16px" }}>
      <TimelineErrorBoundary onTimelineError={handleTimelineError}>
        <TaskOperationErrorBoundary>
          <Timeline
        ref={timelineRef}
        groups={groups}
        items={items}
        defaultTimeStart={dayjs().add(-1, "hour").valueOf()}
        defaultTimeEnd={dayjs().add(6, "hour").valueOf()}

        onItemMove={(itemId, dragTime, newGroupOrder) => {
          const newGroupId = groups[newGroupOrder].id;
          handleItemMove(String(itemId), dragTime, newGroupOrder);
        }}

        onItemResize={(itemId, newTime, edge) => {
          handleItemResize(String(itemId), newTime, edge);
        }}

        onItemSelect={(itemId) =>
          handleItemSelect(String(itemId))
        }

        onItemDoubleClick={handleItemDoubleClick}

        visibleTimeStart={visibleTime.start}
        visibleTimeEnd={visibleTime.end}
        onTimeChange={(start, end) => {
          setVisibleTime({ start, end });
        }}
        itemHeightRatio={0.85}
        lineHeight={32}
        sidebarWidth={200}
        minZoom={60 * 60 * 1000} // 1 hora
        stackItems={false}
        canMove={true}
        canResize={"both"}
        canChangeGroup={true}
        groupRenderer={({ group }) => {
          // Don't allow clicking on the new lane placeholder
          if (group.id === "__new_lane__") {
            return (
              <div className="custom-group w-full opacity-60">
                <span className="title">{group.title}</span>
              </div>
            );
          }
          
          return (
            <div 
              className="custom-group w-full cursor-pointer hover:bg-gray-100 transition-colors" 
              onClick={($event) => handleGroupClick($event, group.id)}
              title="Click para editar"
            >
              <span className="title">{group.title}</span>
            </div>
          );
        }}
      >
        <TodayMarker>
          {({ styles, date }) =>
            <div style={{ ...styles, backgroundColor: "red", zIndex: 99 }} />
          }
        </TodayMarker>
      </Timeline>
        </TaskOperationErrorBoundary>
      </TimelineErrorBoundary>

      <TaskOperationErrorBoundary>
        <EventDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        event={selectedEventItem || null}
        groupName={selectedEventGroup?.title}
        />
      </TaskOperationErrorBoundary>
      
      <TaskOperationErrorBoundary>
        <GroupEditModal
        isOpen={isGroupModalOpen}
        onClose={handleCloseGroupModal}
        group={selectedGroup}
        onSave={handleSaveGroup}
        />
      </TaskOperationErrorBoundary>
    </div>
  );
};
