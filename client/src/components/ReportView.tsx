import type { Alert } from '../types';

// Define a type for the report data we expect from the backend
interface ReportData {
  integrityScore: number;
  focusLostCount: number;
  suspiciousEvents: Alert[];
  candidateName: string;
  interviewId?: string;
  interviewDuration?: string;
}

interface ReportViewProps {
  report: ReportData | null;
}

const getEventDescription = (eventType: string) => {
  switch (eventType.toLowerCase()) {
    case 'candidate_absent':
      return 'Candidate absent from frame';
    case 'multiple_faces':
      return 'Multiple faces detected';
    case 'looking_away':
      return 'Focus lost / Looking away';
    default:
      if (eventType.toLowerCase().includes('object') || eventType.toLowerCase().includes('phone')) {
        return 'Phone/Notes detected';
      }
      return eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
};

const getEventIcon = (eventType: string) => {
  switch (eventType.toLowerCase()) {
    case 'candidate_absent':
      return (
        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    case 'multiple_faces':
      return (
        <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    case 'looking_away':
      return (
        <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
  }
};

const ReportView = ({ report }: ReportViewProps) => {
  if (!report) return null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 75) return 'bg-blue-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  // Group events by type for cleaner display
  const eventCounts = {
    multipleFaces: report.suspiciousEvents.filter(e => e.event?.toLowerCase().includes('multiple_faces')).length,
    absence: report.suspiciousEvents.filter(e => e.event?.toLowerCase().includes('absent')).length,
    phoneNotes: report.suspiciousEvents.filter(e => e.event?.toLowerCase().includes('object') || e.event?.toLowerCase().includes('phone')).length,
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white">
        <h2 className="text-3xl font-bold mb-2">Proctoring Report</h2>
        <p className="text-blue-100">Interview Integrity Analysis</p>
      </div>

      <div className="p-8 space-y-8">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Candidate Name</label>
              <div className="text-xl font-semibold text-gray-900">{report.candidateName}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Interview Duration</label>
              <div className="text-xl font-semibold text-gray-900">{report.interviewDuration || 'Not Available'}</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Number of Times Focus Lost</label>
              <div className="text-xl font-semibold text-gray-900">{report.focusLostCount} times</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Total Suspicious Events</label>
              <div className="text-xl font-semibold text-gray-900">{report.suspiciousEvents.length} events</div>
            </div>
          </div>
        </div>

        {/* Suspicious Events Summary */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Suspicious Events</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <div>
                  <div className="text-2xl font-bold text-orange-600">{eventCounts.multipleFaces}</div>
                  <div className="text-sm text-orange-700">Multiple Faces</div>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div>
                  <div className="text-2xl font-bold text-red-600">{eventCounts.absence}</div>
                  <div className="text-sm text-red-700">Absence</div>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <div>
                  <div className="text-2xl font-bold text-red-600">{eventCounts.phoneNotes}</div>
                  <div className="text-sm text-red-700">Phone/Notes Detected</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Final Integrity Score */}
        <div className="text-center py-8 bg-gray-50 rounded-xl">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Final Integrity Score</h3>
          <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getScoreBackground(report.integrityScore)} border-4 ${getScoreColor(report.integrityScore)} border-current`}>
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(report.integrityScore)}`}>
                {report.integrityScore}
              </div>
              <div className={`text-sm font-medium ${getScoreColor(report.integrityScore)}`}>
                / 100
              </div>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-gray-600">
              Score calculated as: 100 - deductions for violations
            </p>
          </div>
        </div>

        {/* Detailed Event Timeline */}
        {report.suspiciousEvents.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Timeline</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto bg-gray-50 rounded-lg p-4">
              {report.suspiciousEvents.map((event, index) => (
                <div key={index} className="flex items-center space-x-3 bg-white rounded-lg p-3 border border-gray-200">
                  {getEventIcon(event.event || '')}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        {getEventDescription(event.event || '')}
                      </span>
                      <span className="text-sm text-gray-500 font-mono">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {event.details && (
                      <div className="text-xs text-gray-600 mt-1">
                        {typeof event.details === 'object' ? JSON.stringify(event.details) : event.details}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Violations State */}
        {report.suspiciousEvents.length === 0 && (
          <div className="text-center py-8 bg-green-50 rounded-xl border border-green-200">
            <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 className="text-xl font-semibold text-green-900 mb-2">Perfect Interview Session!</h4>
            <p className="text-green-700">No integrity violations were detected during this interview.</p>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-200 pt-6 text-center text-sm text-gray-500">
          <p>Report generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
          {report.interviewId && (
            <p className="mt-1">Session ID: {report.interviewId}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportView;