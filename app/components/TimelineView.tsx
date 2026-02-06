import { useCallback, useState, useEffect } from "react";
import dayjs from "dayjs";
import Timeline, { DateHeader, SidebarHeader, TimelineHeaders, TodayMarker, type Id } from "react-calendar-timeline";
import { GroupEditModal } from "./GroupEditModal";
import { errorLogger } from "~/services/errorLogger";
import { EventDetailsModal } from "./EventDetailsModal";
import { useTimeline } from "~/hooks/useTimeline";
import { type TimelineGroup, type TimelineItem } from "~/store/timelineStore";
import { TaskOperationErrorBoundary, TimelineErrorBoundary } from "./TimelineErrorBoundary";
import { useAriaLive, useKeyboardShortcuts, useAriaAttributes } from "~/hooks/useAccessibility";
import { AriaLiveRegion, Main, createTimelineItemLabel } from "./AccessibilityUtils";

import "dayjs/locale/es";
import "react-calendar-timeline/style.css";
import "~/styles/timeline.tailwind.css";
dayjs.locale("es");

export const TimelineView = () => {
  const { items, groups, timelineRef, handleItemMove, handleItemResize, handleItemSelect, updateGroup, handleItemDeselect, saveItem, finishItem, deleteItem } =
    useTimeline();

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Accessibility hooks
  const { announcePolite, announcementRef } = useAriaLive();
  const { getAriaLabel } = useAriaAttributes();

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'n',
      ctrlKey: true,
      action: () => {
        announcePolite('Press Enter to create a new task');
      },
      description: 'Focus new task input'
    },
    {
      key: 'Escape',
      action: () => {
        setSelectedEvent(null);
        setIsModalOpen(false);
        setIsGroupModalOpen(false);
        announcePolite('Modals closed');
      },
      description: 'Close modals'
    }
  ]);

  const handleTimelineError = useCallback((error: Error) => {
    errorLogger.log(error, {
      severity: 'high',
      context: {
        componentName: 'TimelineView',
        action: 'timeline_render'
      }
    });
    announcePolite(`Timeline error occurred: ${error.message}`);
  }, [announcePolite]);

  const handleTaskError = useCallback((error: Error) => {
    errorLogger.log(error, {
      severity: 'medium',
      context: {
        componentName: 'TimelineView',
        action: 'task_operation'
      }
    });
    announcePolite(`Task operation failed: ${error.message}`);
  }, [announcePolite]);

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
    const item = items.find(i => i.id === eventId);
    const group = groups.find(g => g.id === item?.group);

    setSelectedEvent(eventId);
    setIsModalOpen(true);

    if (item) {
      const label = createTimelineItemLabel(
        item.title,
        dayjs(item.start_time).format('HH:mm'),
        dayjs(item.end_time).format('HH:mm'),
        `${Math.round((item.end_time - item.start_time) / (1000 * 60))} minutes`,
        group?.title
      );
      announcePolite(`Opened task details: ${label}`);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    announcePolite('Task details modal closed');
  };

  const handleGroupClick = (e: React.MouseEvent, groupId: Id) => {
    e.stopPropagation();
    const group = groups.find((g) => g.id === groupId);
    setSelectedGroup(group || null);
    setIsGroupModalOpen(true);

    if (group) {
      announcePolite(`Editing group: ${group.title}`);
    }
  };

  const handleCloseGroupModal = () => {
    setIsGroupModalOpen(false);
    setSelectedGroup(null);
    announcePolite('Group edit modal closed');
  };

  const handleSaveGroup = async (groupId: string, newTitle: string) => {
    try {
      await updateGroup(groupId, newTitle);
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

  const handleSaveEvent = async (updatedEvent: TimelineItem) => {
    try {
      await saveItem(updatedEvent);
      announcePolite('Task changes saved');
      showToast('Tarea guardada', 'success');
      handleCloseModal();
    } catch (e) {
      errorLogger.log(e as Error, { severity: 'medium', context: { componentName: 'TimelineView', action: 'save_event' } });
    }
  }

  const handleFinishEvent = async (eventId: string) => {
    try {
      await finishItem(eventId);
      announcePolite('Task marked as completed');
      showToast('Tarea finalizada', 'success');
      handleCloseModal();
    } catch (e) {
      errorLogger.log(e as Error, { severity: 'medium', context: { componentName: 'TimelineView', action: 'finish_event' } });
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteItem(eventId);
      announcePolite('Task deleted');
      showToast('Tarea eliminada', 'info');
    } catch (e) {
      errorLogger.log(e as Error, { severity: 'medium', context: { componentName: 'TimelineView', action: 'delete_event' } });
    }
  }

  const selectedEventItem = items.find(item => item.id === selectedEvent);
  const selectedEventGroup = groups.find(group => group.id === selectedEventItem?.group);
  // Key to force Timeline remount when item titles change
  const itemsKey = items.map(i => `${i.id}:${i.title}`).join('|');

  return (
    <Main label="Timeline view for task management">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 pointer-events-auto`}> 
          <div className={`px-4 py-2 rounded shadow-lg text-white ${toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}>
            {toast.message}
          </div>
        </div>
      )}
      {/* Skip links for keyboard navigation */}
      <div className="skip-links">
        <a href="#timeline-content" className="skip-link">
          Skip to timeline content
        </a>
        <a href="#timeline-controls" className="skip-link">
          Skip to timeline controls
        </a>
      </div>

      {/* Screen reader announcements */}
      <AriaLiveRegion />

      <div
        id="timeline-content"
        className="timeline-container mt-4 rounded-lg border border-gray-300 bg-white shadow-lg h-60 overflow-auto resize-y min-h-60 max-h-[80vh]"
        style={{ resize: 'vertical' }}
        role="application"
        aria-label="Task timeline"
        aria-describedby="timeline-instructions"
      >
        <TimelineErrorBoundary onTimelineError={handleTimelineError}>
          <TaskOperationErrorBoundary>
            <Timeline
              key={itemsKey}
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

              onItemDeselect={handleItemDeselect}

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
                    className="custom-group w-full cursor-pointer hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={($event) => handleGroupClick($event, group.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleGroupClick(e as any, group.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Edit group: ${group.title}`}
                    aria-describedby={`group-${group.id}-count`}
                    title={`Click to edit ${group.title}`}
                  >
                    <span className="title">{group.title}</span>
                    <span
                      id={`group-${group.id}-count`}
                      className="sr-only"
                      aria-live="polite"
                    >
                      {items.filter(item => item.group === group.id).length} tasks
                    </span>
                  </div>
                );
              }}
            >
              <TimelineHeaders className="sticky top-0 z-81">
                <SidebarHeader>
                  {({ getRootProps }) => {
                    return <div {...getRootProps()} className="sidebar__header__title">Objetivo</div>;
                  }}
                </SidebarHeader>
                <DateHeader unit="primaryHeader" />
                <DateHeader />
              </TimelineHeaders>
              <TodayMarker>
                {({ styles, date }) =>
                  <div
                    style={{ ...styles, backgroundColor: "red", zIndex: 99 }}
                    role="separator"
                    aria-label={`Current time: ${dayjs(date).format('HH:mm')}`}
                    aria-orientation="vertical"
                  />
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
            onSave={handleSaveEvent}
            onDelete={handleDeleteEvent}
            onFinish={handleFinishEvent}
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

        {/* Hidden instructions for screen readers */}
        <div
          id="timeline-instructions"
          className="sr-only"
          aria-live="polite"
        >
          Timeline interface. Use arrow keys to navigate between tasks, Enter to select, and Space to activate. Press Ctrl+N to create a new task. Press Escape to close dialogs.
        </div>

        {/* Keyboard shortcut help */}
        {/* <div
          id="timeline-controls"
          className="mt-4 p-4 bg-gray-50 rounded-lg"
          role="region"
          aria-labelledby="shortcut-help-title"
        >
          <h2
            id="shortcut-help-title"
            className="text-sm font-semibold text-gray-700 mb-2"
          >
            Keyboard Shortcuts
          </h2>
          <ul className="text-xs text-gray-600 space-y-1" role="list">
            <li><kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">N</kbd> - New task</li>
            <li><kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Escape</kbd> - Close modals</li>
            <li><kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Arrow Keys</kbd> - Navigate timeline</li>
            <li><kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Enter</kbd> - Select item</li>
            <li><kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Space</kbd> - Activate item</li>
          </ul>
        </div> */}
      </div>
    </Main>
  );
};
