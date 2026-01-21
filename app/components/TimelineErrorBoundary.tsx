import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';

interface TimelineErrorBoundaryProps {
  children: React.ReactNode;
  onTimelineError?: (error: Error) => void;
}

const TimelineFallback = ({ onReset }: { onReset: () => void }) => (
  <div className="w-full p-8">
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <svg
            className="w-6 h-6 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.312 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">
            Timeline Error
          </h3>
          <p className="text-sm text-yellow-700 mb-4">
            There was an issue loading the timeline. Your tasks are safe, but the display encountered an error.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={onReset}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
            >
              Reload Timeline
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white text-yellow-700 border border-yellow-300 rounded-lg hover:bg-yellow-50 transition-colors text-sm font-medium"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const TimelineErrorBoundary: React.FC<TimelineErrorBoundaryProps> = ({
  children,
  onTimelineError
}) => {
  const handleError = React.useCallback((error: Error) => {
    console.error('Timeline error caught:', error);
    onTimelineError?.(error);
  }, [onTimelineError]);

  return (
    <ErrorBoundary
      fallback={<TimelineFallback onReset={() => window.location.reload()} />}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  );
};

// Specific error boundary for task operations
export const TaskOperationErrorBoundary: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => {
  const taskFallback = fallback || (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-sm text-red-700">
        Task operation failed. Please try again.
      </p>
    </div>
  );

  return (
    <ErrorBoundary fallback={taskFallback}>
      {children}
    </ErrorBoundary>
  );
};

// Error boundary for async data operations
export const AsyncDataErrorBoundary: React.FC<{
  children: React.ReactNode;
  onError?: (error: Error) => void;
}> = ({ children, onError }) => {
  const asyncFallback = (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-sm text-gray-600">
          Something went wrong while loading data.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  const handleAsyncError = React.useCallback((error: Error) => {
    console.error('Async operation error:', error);
    onError?.(error);
  }, [onError]);

  return (
    <ErrorBoundary
      fallback={asyncFallback}
      onError={handleAsyncError}
    >
      {children}
    </ErrorBoundary>
  );
};