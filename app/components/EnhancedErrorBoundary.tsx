import React, { Component, ErrorInfo, ReactNode } from 'react';
import { errorRecovery, useErrorRecovery } from '../services/errorRecovery';
import { errorLogger } from '../services/errorLogger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showRecovery?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  recoveryAttempted: boolean;
  recoverySuccess?: boolean;
}

// Enhanced error boundary with recovery options
export class EnhancedErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      recoveryAttempted: false 
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      recoveryAttempted: false 
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('EnhancedErrorBoundary caught an error:', error, errorInfo);
    
    // Log the error
    errorLogger.log(error, {
      componentStack: errorInfo.componentStack,
      severity: 'high',
      context: {
        componentName: 'EnhancedErrorBoundary',
        action: 'error_boundary_catch'
      }
    });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Update state with error info
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      recoveryAttempted: false,
      recoverySuccess: undefined
    });
  };

  handleRecovery = async (recoveryActionId: string) => {
    if (!this.state.error) return;

    const actions = errorRecovery.getRecoveryActions(this.state.error);
    const action = actions.find(a => a.id === recoveryActionId);
    
    if (!action) return;

    try {
      const success = await errorRecovery.executeRecovery(action);
      
      this.setState({
        recoveryAttempted: true,
        recoverySuccess: success
      });

      // If recovery was successful, reset the error boundary
      if (success) {
        setTimeout(() => {
          this.handleReset();
        }, 1000);
      }
    } catch (error) {
      console.error('Recovery action failed:', error);
      this.setState({
        recoveryAttempted: true,
        recoverySuccess: false
      });
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorBoundaryUI
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
          onRecovery={this.handleRecovery}
          showRecovery={this.props.showRecovery !== false}
          recoveryAttempted={this.state.recoveryAttempted}
          recoverySuccess={this.state.recoverySuccess}
        />
      );
    }

    return this.props.children;
  }
}

// Separate UI component for better organization
interface ErrorBoundaryUIProps {
  error?: Error;
  errorInfo?: ErrorInfo;
  onReset: () => void;
  onRecovery: (actionId: string) => void;
  showRecovery: boolean;
  recoveryAttempted: boolean;
  recoverySuccess?: boolean;
}

const ErrorBoundaryUI: React.FC<ErrorBoundaryUIProps> = ({
  error,
  errorInfo,
  onReset,
  onRecovery,
  showRecovery,
  recoveryAttempted,
  recoverySuccess
}) => {
  const [showDetails, setShowDetails] = React.useState(false);
  
  const recoveryActions = React.useMemo(() => {
    if (!error || !showRecovery) return [];
    return errorRecovery.getRecoveryActions(error);
  }, [error, showRecovery]);

  const handleDownloadLogs = () => {
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
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-red-200">
        <div className="p-6">
          {/* Status Icon */}
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4">
            {recoveryAttempted ? (
              recoverySuccess ? (
                <div className="w-full h-full bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <div className="w-full h-full bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                  </svg>
                </div>
              )
            ) : (
              <div className="w-full h-full bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.312 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            )}
          </div>
          
          {/* Title and Message */}
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
            {recoveryAttempted 
              ? (recoverySuccess ? 'Recovery Successful' : 'Recovery Failed')
              : 'Something went wrong'
            }
          </h2>
          
          <p className="text-sm text-gray-600 text-center mb-6">
            {recoveryAttempted 
              ? (recoverySuccess ? 'The issue has been resolved.' : 'Recovery action failed. Try another option.')
              : 'An unexpected error occurred. Try one of the recovery options below.'
            }
          </p>

          {/* Recovery Actions */}
          {!recoveryAttempted && showRecovery && recoveryActions.length > 0 && (
            <div className="space-y-2 mb-6">
              <h3 className="text-sm font-medium text-gray-700">Recovery Options:</h3>
              {recoveryActions.map(action => (
                <button
                  key={action.id}
                  onClick={() => onRecovery(action.id)}
                  className="w-full px-3 py-2 text-left bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                >
                  <div className="font-medium text-sm text-blue-900">{action.name}</div>
                  <div className="text-xs text-blue-700">{action.description}</div>
                </button>
              ))}
            </div>
          )}

          {/* Standard Actions */}
          <div className="space-y-3">
            <button
              onClick={onReset}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Try Again
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Reload Page
              </button>
              
              <button
                onClick={handleDownloadLogs}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Download Logs
              </button>
            </div>
          </div>

          {/* Error Details (Development) */}
          {process.env.NODE_ENV === 'development' && error && (
            <details className="mt-6">
              <summary 
                className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 text-center"
                onClick={() => setShowDetails(!showDetails)}
              >
                Error Details
              </summary>
              {showDetails && (
                <div className="mt-3 p-3 bg-gray-50 rounded border text-xs font-mono text-gray-800 max-h-32 overflow-auto">
                  <div className="text-red-600 font-semibold mb-2">
                    {error.name}: {error.message}
                  </div>
                  {error.stack && (
                    <pre className="whitespace-pre-wrap">{error.stack}</pre>
                  )}
                  {errorInfo?.componentStack && (
                    <div className="mt-2">
                      <div className="font-semibold text-blue-600 mb-1">Component Stack:</div>
                      <pre className="whitespace-pre-wrap text-blue-800">{errorInfo.componentStack}</pre>
                    </div>
                  )}
                </div>
              )}
            </details>
          )}
        </div>
      </div>
    </div>
  );
};