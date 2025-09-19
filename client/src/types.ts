export interface Alert {
  timestamp: string;
  message: string;
  details?: any;
  event?: string;
}

export interface ReportData {
  integrityScore: number;
  focusLostCount: number;
  suspiciousEvents: Alert[];
  candidateName: string;
}
export interface Interview {
  interviewId: string;
  videoUrl?: string;
  createdAt: string; // Dates are usually sent as ISO strings
  eventCount: number;
  hasEvents: boolean;
}