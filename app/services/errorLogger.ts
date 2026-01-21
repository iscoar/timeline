interface ErrorLog {
  id: string;
  timestamp: number;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  componentStack?: string;
  userAgent: string;
  url: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: {
    componentName?: string;
    action?: string;
    additionalData?: Record<string, any>;
  };
}

class ErrorLogger {
  private logs: ErrorLog[] = [];
  private maxLogs = 100; // Keep only last 100 errors
  private subscribers: ((log: ErrorLog) => void)[] = [];

  constructor() {
    // Log unhandled errors
    if (typeof window !== 'undefined') {
      window.addEventListener('error', this.handleGlobalError.bind(this));
      window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
    }
  }

  private handleGlobalError(event: ErrorEvent) {
    this.log({
      name: 'GlobalError',
      message: event.message,
      stack: event.error?.stack,
    }, {
      severity: 'critical',
      context: {
        additionalData: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        }
      }
    });
  }

  private handlePromiseRejection(event: PromiseRejectionEvent) {
    this.log({
      name: 'UnhandledPromiseRejection',
      message: event.reason?.message || String(event.reason),
      stack: event.reason?.stack,
    }, {
      severity: 'high',
      context: {
        additionalData: {
          reason: event.reason,
        }
      }
    });
  }

  log(error: Partial<Error>, options: {
    componentStack?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    context?: ErrorLog['context'];
  } = {}): string {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: Date.now(),
      error: {
        name: error.name || 'Error',
        message: error.message || 'Unknown error',
        stack: error.stack,
      },
      componentStack: options.componentStack,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server',
      url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
      severity: options.severity || 'medium',
      context: options.context,
    };

    this.addLog(errorLog);
    return errorLog.id;
  }

  private addLog(log: ErrorLog) {
    this.logs.push(log);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Notify subscribers
    this.subscribers.forEach(callback => callback(log));

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error Log [${log.severity.toUpperCase()}]`);
      console.error(log.error);
      if (log.componentStack) {
        console.log('Component Stack:', log.componentStack);
      }
      if (log.context) {
        console.log('Context:', log.context);
      }
      console.groupEnd();
    }

    // In production, you could send to an error tracking service
    // like Sentry, LogRocket, or your own backend
    this.sendToExternalService?.(log);
  }

  private sendToExternalService?: (log: ErrorLog) => void;

  // Method to configure external error service integration
  setExternalService(sender: (log: ErrorLog) => void) {
    this.sendToExternalService = sender;
  }

  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  getLogsBySeverity(severity: ErrorLog['severity']): ErrorLog[] {
    return this.logs.filter(log => log.severity === severity);
  }

  clearLogs(): void {
    this.logs = [];
  }

  subscribe(callback: (log: ErrorLog) => void): () => void {
    this.subscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  private generateId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Export logs for debugging
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Get error statistics
  getStats() {
    const stats = {
      total: this.logs.length,
      bySeverity: {} as Record<string, number>,
      byComponent: {} as Record<string, number>,
      recent: this.logs.slice(-10)
    };

    this.logs.forEach(log => {
      stats.bySeverity[log.severity] = (stats.bySeverity[log.severity] || 0) + 1;
      
      const componentName = log.context?.componentName || 'Unknown';
      stats.byComponent[componentName] = (stats.byComponent[componentName] || 0) + 1;
    });

    return stats;
  }
}

// Singleton instance
export const errorLogger = new ErrorLogger();

// Hook for React components
export const useErrorLogger = () => {
  const [logs, setLogs] = React.useState<ErrorLog[]>([]);

  React.useEffect(() => {
    const unsubscribe = errorLogger.subscribe((log) => {
      setLogs(prev => [...prev.slice(-99), log]); // Keep last 100 in state
    });

    return unsubscribe;
  }, []);

  return {
    logs,
    clearLogs: () => {
      errorLogger.clearLogs();
      setLogs([]);
    },
    exportLogs: () => errorLogger.exportLogs(),
    getStats: () => errorLogger.getStats(),
  };
};