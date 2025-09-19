import type { Alert } from '../types';

interface AlertsPanelProps {
  alerts: Alert[];
}

const getAlertIcon = (message: string) => {
  if (message.includes('multiple faces') || message.includes('faces detected')) {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    );
  }
  if (message.includes('looking away') || message.includes('not visible')) {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    );
  }
  if (message.includes('object') || message.includes('phone') || message.includes('book') || message.includes('laptop')) {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  }
  // Default warning icon
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  );
};

const getAlertSeverity = (message: string) => {
  if (message.includes('multiple faces') || message.includes('object')) {
    return 'high';
  }
  if (message.includes('looking away')) {
    return 'medium';
  }
  if (message.includes('not visible')) {
    return 'high';
  }
  return 'low';
};

const getSeverityStyles = (severity: string) => {
  switch (severity) {
    case 'high':
      return {
        container: 'bg-red-50 border-red-200 hover:bg-red-100',
        icon: 'text-red-500',
        timestamp: 'text-red-700',
        message: 'text-red-900',
        badge: 'bg-red-100 text-red-800'
      };
    case 'medium':
      return {
        container: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
        icon: 'text-orange-500',
        timestamp: 'text-orange-700',
        message: 'text-orange-900',
        badge: 'bg-orange-100 text-orange-800'
      };
    default:
      return {
        container: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
        icon: 'text-yellow-500',
        timestamp: 'text-yellow-700',
        message: 'text-yellow-900',
        badge: 'bg-yellow-100 text-yellow-800'
      };
  }
};

const AlertsPanel = ({ alerts }: AlertsPanelProps) => {
  return (
    <div className="h-full flex flex-col">
      {/* Header Stats */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Event Summary</span>
          <span className="text-xs text-gray-500">Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-red-50 border border-red-100 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-red-600">
              {alerts.filter(alert => getAlertSeverity(alert.message) === 'high').length}
            </div>
            <div className="text-xs text-red-700">High</div>
          </div>
          <div className="bg-orange-50 border border-orange-100 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-orange-600">
              {alerts.filter(alert => getAlertSeverity(alert.message) === 'medium').length}
            </div>
            <div className="text-xs text-orange-700">Medium</div>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-gray-600">{alerts.length}</div>
            <div className="text-xs text-gray-700">Total</div>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">All Clear!</h3>
              <p className="text-sm text-gray-500">No integrity violations detected.</p>
              <p className="text-xs text-gray-400 mt-2">Keep up the good work!</p>
            </div>
          ) : (
            alerts.map((alert, index) => {
              const severity = getAlertSeverity(alert.message);
              const styles = getSeverityStyles(severity);
              const icon = getAlertIcon(alert.message);
              
              return (
                <div 
                  key={index} 
                  className={`p-3 border rounded-xl transition-all duration-200 hover:shadow-sm ${styles.container}`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-white/50 flex items-center justify-center ${styles.icon}`}>
                      {icon}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-mono ${styles.timestamp}`}>
                          {alert.timestamp}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles.badge}`}>
                          {severity.toUpperCase()}
                        </span>
                      </div>
                      <p className={`text-sm font-medium ${styles.message} leading-relaxed`}>
                        {alert.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer */}
      {alerts.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{alerts.length} event{alerts.length !== 1 ? 's' : ''} recorded</span>
            <span>Monitoring active</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsPanel;