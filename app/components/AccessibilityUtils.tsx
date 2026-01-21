import React from 'react';

interface AriaLiveRegionProps {
  politeness?: React.AriaAttributes['aria-live'];
  atomic?: React.AriaAttributes['aria-atomic'];
  relevant?: React.AriaAttributes['aria-relevant'];
  busy?: React.AriaAttributes['aria-busy'];
  className?: string;
}

export const AriaLiveRegion: React.FC<AriaLiveRegionProps> = ({
  politeness = 'polite',
  atomic = false,
  relevant = 'additions text',
  busy = false,
  className = ''
}) => {
  return (
    <div
      className={`sr-only ${className}`}
      aria-live={politeness}
      aria-atomic={atomic}
      aria-relevant={relevant}
      aria-busy={busy}
    />
  );
};

export const srOnly = `
  sr-only
  absolute
  -m-px
  h-px
  w-px
  overflow-hidden
  whitespace-nowrap
  border-0
  p-0
  clip-path: inset(50%);
`;

export const focusVisibleStyles = `
  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-blue-500
  focus-visible:ring-offset-2
`;

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export const SkipLink: React.FC<SkipLinkProps> = ({
  href,
  children,
  className = ''
}) => {
  return (
    <a
      href={href}
      className={`
        absolute -top-full left-0 z-50 
        bg-blue-600 text-white px-4 py-2 
        transform transition-transform 
        focus:top-4 focus:left-4
        rounded-md font-medium
        ${className}
      `}
    >
      {children}
    </a>
  );
};

// Landmark components for semantic structure
interface MainProps {
  children: React.ReactNode;
  labelledBy?: string;
  label?: string;
}

export const Main: React.FC<MainProps> = ({ children, labelledBy, label }) => (
  <main 
    role="main" 
    aria-labelledby={labelledBy}
    aria-label={label}
  >
    {children}
  </main>
);

interface NavigationProps {
  children: React.ReactNode;
  labelledBy?: string;
  label?: string;
}

export const Navigation: React.FC<NavigationProps> = ({ children, labelledBy, label }) => (
  <nav 
    aria-labelledby={labelledBy}
    aria-label={label}
  >
    {children}
  </nav>
);

interface RegionProps {
  children: React.ReactNode;
  labelledBy?: string;
  label?: string;
  role?: string;
}

export const Region: React.FC<RegionProps> = ({ children, labelledBy, label, role }) => (
  <div 
    role={role}
    aria-labelledby={labelledBy}
    aria-label={label}
  >
    {children}
  </div>
);

export const createAriaLabel = (element: string, action?: string, state?: string) => {
  const parts = [element];
  if (action) parts.push(action);
  if (state) parts.push(state);
  return parts.join(', ');
};

export const createTimelineItemLabel = (
  taskName: string,
  startTime: string,
  endTime: string,
  duration: string,
  group?: string
) => {
  const parts = [
    `Task: ${taskName}`,
    `Start: ${startTime}`,
    `End: ${endTime}`,
    `Duration: ${duration}`
  ];
  
  if (group) {
    parts.push(`Group: ${group}`);
  }
  
  return parts.join('. ');
};

export const createButtonLabel = (action: string, target?: string, result?: string) => {
  const parts = [action];
  if (target) parts.push(target);
  if (result) parts.push(result);
  return parts.join(' ');
};