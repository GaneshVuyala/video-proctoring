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