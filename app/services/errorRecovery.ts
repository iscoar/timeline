import { errorLogger } from './errorLogger';

interface RecoveryAction {
  id: string;
  name: string;
  description: string;
  action: () => Promise<void> | void;
  severity: 'low' | 'medium' | 'high';
}

export class ErrorRecovery {
  private recoveryActions: Map<string, RecoveryAction[]> = new Map();
  private recoveryHistory: Array<{
    actionId: string;
    timestamp: number;
    success: boolean;
    error?: string;
  }> = [];

  // Register recovery actions for specific error types
  registerRecoveryAction(errorPattern: string, action: RecoveryAction) {
    if (!this.recoveryActions.has(errorPattern)) {
      this.recoveryActions.set(errorPattern, []);
    }
    this.recoveryActions.get(errorPattern)!.push(action);
  }

  // Get available recovery actions for an error
  getRecoveryActions(error: Error): RecoveryAction[] {
    const actions: RecoveryAction[] = [];

    // Check for direct error name matches
    if (this.recoveryActions.has(error.name)) {
      actions.push(...this.recoveryActions.get(error.name)!);
    }

    // Check for pattern matches in error message
    for (const [pattern, patternActions] of this.recoveryActions.entries()) {
      if (error.message.toLowerCase().includes(pattern.toLowerCase())) {
        actions.push(...patternActions);
      }
    }

    // Add generic recovery actions
    actions.push(...this.getGenericRecoveryActions());

    // Remove duplicates and sort by severity
    const uniqueActions = actions.filter((action, index, self) => 
      index === self.findIndex(a => a.id === action.id)
    );

    return uniqueActions.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  // Execute a recovery action
  async executeRecovery(action: RecoveryAction): Promise<boolean> {
    try {
      await action.action();
      
      this.recoveryHistory.push({
        actionId: action.id,
        timestamp: Date.now(),
        success: true
      });

      errorLogger.log({
        name: 'RecoveryAction',
        message: `Successfully executed recovery action: ${action.name}`,
      }, {
        severity: 'low',
        context: {
          componentName: 'ErrorRecovery',
          action: 'recovery_success',
          additionalData: { actionId: action.id, actionName: action.name }
        }
      });

      return true;
    } catch (error) {
      this.recoveryHistory.push({
        actionId: action.id,
        timestamp: Date.now(),
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });

      errorLogger.log({
        name: 'RecoveryActionFailed',
        message: `Recovery action failed: ${action.name}`,
        stack: error instanceof Error ? error.stack : undefined
      }, {
        severity: 'medium',
        context: {
          componentName: 'ErrorRecovery',
          action: 'recovery_failed',
          additionalData: { actionId: action.id, actionName: action.name }
        }
      });

      return false;
    }
  }

  // Get generic recovery actions that work for most errors
  private getGenericRecoveryActions(): RecoveryAction[] {
    return [
      {
        id: 'reload-timeline',
        name: 'Reload Timeline',
        description: 'Reload the timeline component without losing your data',
        action: () => {
          // Trigger timeline reload
          window.dispatchEvent(new CustomEvent('reload-timeline'));
        },
        severity: 'high'
      },
      {
        id: 'reset-local-storage',
        name: 'Reset Cache',
        description: 'Clear local storage and reload the page',
        action: () => {
          localStorage.clear();
          window.location.reload();
        },
        severity: 'medium'
      },
      {
        id: 'download-error-logs',
        name: 'Download Error Logs',
        description: 'Download error logs for debugging',
        action: () => {
          const logs = errorLogger.exportLogs();
          const blob = new Blob([logs], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `timeline-error-logs-${Date.now()}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        },
        severity: 'low'
      }
    ];
  }

  // Get recovery history
  getRecoveryHistory(): typeof this.recoveryHistory {
    return [...this.recoveryHistory];
  }

  // Clear recovery history
  clearHistory(): void {
    this.recoveryHistory = [];
  }
}

// Singleton instance
export const errorRecovery = new ErrorRecovery();

// Hook for React components
export const useErrorRecovery = (error: Error | null) => {
  const [recoveryActions, setRecoveryActions] = React.useState<RecoveryAction[]>([]);

  React.useEffect(() => {
    if (error) {
      const actions = errorRecovery.getRecoveryActions(error);
      setRecoveryActions(actions);
    } else {
      setRecoveryActions([]);
    }
  }, [error]);

  const executeRecovery = React.useCallback(async (action: RecoveryAction) => {
    return await errorRecovery.executeRecovery(action);
  }, []);

  return {
    recoveryActions,
    executeRecovery,
    getHistory: () => errorRecovery.getRecoveryHistory(),
    clearHistory: () => errorRecovery.clearHistory(),
  };
};