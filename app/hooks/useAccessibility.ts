import { useEffect, useRef, useState, useCallback } from 'react';

// Hook for managing focus within a component
export const useFocusManagement = (isOpen: boolean) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(
      containerRef.current.querySelectorAll(focusableSelectors)
    ) as HTMLElement[];
  }, []);

  const focusFirstElement = useCallback(() => {
    const elements = getFocusableElements();
    if (elements.length > 0) {
      elements[0].focus();
    }
  }, [getFocusableElements]);

  const focusLastElement = useCallback(() => {
    const elements = getFocusableElements();
    if (elements.length > 0) {
      elements[elements.length - 1].focus();
    }
  }, [getFocusableElements]);

  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus the first element in the container
      focusFirstElement();
      
      // Trap focus within the container
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Tab') {
          const focusableElements = getFocusableElements();
          
          if (focusableElements.length === 0) return;
          
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];
          
          if (event.shiftKey) {
            if (document.activeElement === firstElement) {
              event.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              event.preventDefault();
              firstElement.focus();
            }
          }
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      // Restore focus to the previously focused element
      if (previousFocusRef.current && previousFocusRef.current.focus) {
        previousFocusRef.current.focus();
      }
    }
  }, [isOpen, getFocusableElements, focusFirstElement]);

  return { containerRef, focusFirstElement, focusLastElement };
};

// Hook for keyboard navigation patterns
export const useKeyboardNavigation = (
  items: Array<{ id: string | number; element?: HTMLElement }>,
  options: {
    orientation?: 'horizontal' | 'vertical';
    loop?: boolean;
    onSelect?: (id: string | number) => void;
  } = {}
) => {
  const { orientation = 'vertical', loop = true, onSelect } = options;
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const navigate = useCallback((direction: 'next' | 'previous' | 'first' | 'last') => {
    setFocusedIndex(current => {
      let newIndex: number;
      
      switch (direction) {
        case 'next':
          newIndex = current + 1;
          if (newIndex >= items.length) {
            newIndex = loop ? 0 : items.length - 1;
          }
          break;
        case 'previous':
          newIndex = current - 1;
          if (newIndex < 0) {
            newIndex = loop ? items.length - 1 : 0;
          }
          break;
        case 'first':
          newIndex = 0;
          break;
        case 'last':
          newIndex = items.length - 1;
          break;
        default:
          return current;
      }
      
      // Focus the element
      const item = items[newIndex];
      if (item?.element) {
        item.element.focus();
      }
      
      return newIndex;
    });
  }, [items, loop]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    const isHorizontal = orientation === 'horizontal';
    const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';
    const previousKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';
    
    switch (event.key) {
      case nextKey:
        event.preventDefault();
        navigate('next');
        break;
      case previousKey:
        event.preventDefault();
        navigate('previous');
        break;
      case 'Home':
        event.preventDefault();
        navigate('first');
        break;
      case 'End':
        event.preventDefault();
        navigate('last');
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (focusedIndex >= 0 && items[focusedIndex]) {
          onSelect?.(items[focusedIndex].id);
        }
        break;
    }
  }, [navigate, focusedIndex, items, orientation, onSelect]);

  return { focusedIndex, setFocusedIndex, handleKeyDown, navigate };
};

// Hook for screen reader announcements
export const useAriaLive = () => {
  const announcementRef = useRef<HTMLDivElement>(null);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announcementRef.current) {
      announcementRef.current.setAttribute('aria-live', priority);
      announcementRef.current.textContent = message;
      
      // Clear the announcement after a delay to allow repeated announcements
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = '';
        }
      }, 1000);
    }
  }, []);

  const announcePolite = useCallback((message: string) => {
    announce(message, 'polite');
  }, [announce]);

  const announceAssertive = useCallback((message: string) => {
    announce(message, 'assertive');
  }, [announce]);

  return { announcementRef, announce, announcePolite, announceAssertive };
};

// Hook for managing ARIA attributes
export const useAriaAttributes = () => {
  const getAriaLabel = useCallback((element: string, action?: string, details?: string) => {
    let label = element;
    
    if (action) {
      label += `, ${action}`;
    }
    
    if (details) {
      label += `, ${details}`;
    }
    
    return label;
  }, []);

  const getAriaDescribedBy = useCallback((...ids: (string | undefined)[]) => {
    return ids.filter(Boolean).join(' ');
  }, []);

  return { getAriaLabel, getAriaDescribedBy };
};

// Hook for keyboard shortcuts
export const useKeyboardShortcuts = (
  shortcuts: Array<{
    key: string;
    ctrlKey?: boolean;
    altKey?: boolean;
    shiftKey?: boolean;
    metaKey?: boolean;
    action: () => void;
    description: string;
  }>
) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = (shortcut.ctrlKey ?? false) === event.ctrlKey;
        const altMatches = (shortcut.altKey ?? false) === event.altKey;
        const shiftMatches = (shortcut.shiftKey ?? false) === event.shiftKey;
        const metaMatches = (shortcut.metaKey ?? false) === event.metaKey;

        if (keyMatches && ctrlMatches && altMatches && shiftMatches && metaMatches) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  const getShortcutHelp = useCallback(() => {
    return shortcuts.map(shortcut => {
      const keys = [];
      if (shortcut.ctrlKey) keys.push('Ctrl');
      if (shortcut.altKey) keys.push('Alt');
      if (shortcut.shiftKey) keys.push('Shift');
      if (shortcut.metaKey) keys.push('Cmd');
      keys.push(shortcut.key);
      
      return {
        keys: keys.join(' + '),
        description: shortcut.description
      };
    });
  }, [shortcuts]);

  return { getShortcutHelp };
};