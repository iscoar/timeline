import type { TimelineItem, TimelineGroup } from "~/store/timelineStore";
import { errorLogger } from "./errorLogger";

const STORAGE_KEYS = {
  ITEMS: 'timeline-items',
  GROUPS: 'timeline-groups',
} as const;

export const localStorageService = {
  // Save items to localStorage
  saveItems: (items: TimelineItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    } catch (error) {
      errorLogger.log({
        name: 'LocalStorageError',
        message: 'Failed to save items to localStorage',
        stack: error instanceof Error ? error.stack : undefined
      }, {
        severity: 'medium',
        context: {
          componentName: 'localStorageService',
          action: 'save_items',
          additionalData: { itemsCount: items.length }
        }
      });
      console.error('Error saving items to localStorage:', error);
    }
  },

  // Load items from localStorage
  loadItems: (): TimelineItem[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ITEMS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      errorLogger.log({
        name: 'LocalStorageError',
        message: 'Failed to load items from localStorage',
        stack: error instanceof Error ? error.stack : undefined
      }, {
        severity: 'medium',
        context: {
          componentName: 'localStorageService',
          action: 'load_items'
        }
      });
      console.error('Error loading items from localStorage:', error);
      return [];
    }
  },

  // Save groups to localStorage
  saveGroups: (groups: TimelineGroup[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
    } catch (error) {
      errorLogger.log({
        name: 'LocalStorageError',
        message: 'Failed to save groups to localStorage',
        stack: error instanceof Error ? error.stack : undefined
      }, {
        severity: 'medium',
        context: {
          componentName: 'localStorageService',
          action: 'save_groups',
          additionalData: { groupsCount: groups.length }
        }
      });
      console.error('Error saving groups to localStorage:', error);
    }
  },

  // Load groups from localStorage
  loadGroups: (): TimelineGroup[] | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GROUPS);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      errorLogger.log({
        name: 'LocalStorageError',
        message: 'Failed to load groups from localStorage',
        stack: error instanceof Error ? error.stack : undefined
      }, {
        severity: 'medium',
        context: {
          componentName: 'localStorageService',
          action: 'load_groups'
        }
      });
      console.error('Error loading groups from localStorage:', error);
      return null;
    }
  },

  // Clear all timeline data
  clearAll: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.ITEMS);
      localStorage.removeItem(STORAGE_KEYS.GROUPS);
    } catch (error) {
      errorLogger.log({
        name: 'LocalStorageError',
        message: 'Failed to clear localStorage',
        stack: error instanceof Error ? error.stack : undefined
      }, {
        severity: 'low',
        context: {
          componentName: 'localStorageService',
          action: 'clear_all'
        }
      });
      console.error('Error clearing localStorage:', error);
    }
  },
};