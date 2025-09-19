import { useState, useEffect } from 'react';
import { useAuth } from "../context/AuthContext";
import { getInterviews, getReport } from '../services/api';
import type { ReportData } from '../types';
import ReportView from './ReportView';

// This interface matches the data we are now sending from the backend
interface Interview {
  interviewId: string;
  videoUrl?: string;
  createdAt?: string;
}

export default function InterviewerDashboard() {
  const { logout } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'with_video' | 'without_video'>('all');

  useEffect(() => {
    const fetchInterviews = async () => {
      setIsLoading(true);
      const interviewData = await getInterviews(); 
      if (interviewData) {
        setInterviews(interviewData);
      }
      setIsLoading(false);
    };
    fetchInterviews();
  }, []);

  const handleViewReport = async (interview: Interview) => {
    setIsLoading(true);
    setSelectedInterview(interview);
    const reportData = await getReport(interview.interviewId);
    setSelectedReport(reportData);
    setIsLoading(false);
  };

  // Filter interviews based on search and status
  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch = interview.interviewId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'with_video' && interview.videoUrl) ||
      (filterStatus === 'without_video' && !interview.videoUrl);
    
    return matchesSearch && matchesFilter;
  });

  const getInterviewStats = () => {
    return {
      total: interviews.length,
      withVideo: interviews.filter(i => i.videoUrl).length,
      withoutVideo: interviews.filter(i => !i.videoUrl).length,
    };
  };

  const stats = getInterviewStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Interviewer Dashboard</h1>
                <p className="text-sm text-gray-500">Review completed interview sessions</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-700">{stats.total} Sessions</span>
              </div>
              <button 
                onClick={logout} 
                className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all duration-200 hover:shadow-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          
          {/* Left Sidebar - Interview List */}
          <div className="xl:col-span-1 space-y-6">
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                    <div className="text-sm text-gray-600">Total Sessions</div>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
                  <div className="text-lg font-bold text-green-600">{stats.withVideo}</div>
                  <div className="text-xs text-gray-600">With Video</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
                  <div className="text-lg font-bold text-orange-600">{stats.withoutVideo}</div>
                  <div className="text-xs text-gray-600">No Video</div>
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Sessions</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by interview ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 pl-10 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="all">All Sessions</option>
                    <option value="with_video">With Video</option>
                    <option value="without_video">Without Video</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Interview List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Interview Sessions
                  <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {filteredInterviews.length}
                  </span>
                </h3>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="ml-2 text-gray-600">Loading sessions...</span>
                  </div>
                ) : filteredInterviews.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {filteredInterviews.map((interview) => (
                      <div key={interview.interviewId} className="p-4 hover:bg-gray-50 transition-colors duration-200">
                        <button
                          onClick={() => handleViewReport(interview)}
                          className="w-full text-left space-y-2"
                          disabled={isLoading && selectedInterview?.interviewId === interview.interviewId}
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-gray-900 truncate">
                              {interview.interviewId.slice(0, 20)}...
                            </div>
                            {interview.videoUrl && (
                              <div className="flex-shrink-0 w-5 h-5 text-green-500">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {interview.createdAt ? new Date(interview.createdAt).toLocaleDateString() : 'No date'}
                          </div>
                          {isLoading && selectedInterview?.interviewId === interview.interviewId && (
                            <div className="flex items-center text-blue-600 text-sm">
                              <svg className="animate-spin h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Loading report...
                            </div>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p>No sessions found</p>
                    <p className="text-sm text-gray-400">Try adjusting your search or filter</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right Panel - Report and Video */}
          <div className="xl:col-span-3 space-y-6">
            
            {/* Video Section */}
            {selectedInterview?.videoUrl && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Interview Recording
                  </h3>
                  <p className="text-green-100 text-sm mt-1">Session: {selectedInterview.interviewId.slice(-12)}</p>
                </div>
                <div className="p-6">
                  <video 
                    src={selectedInterview.videoUrl} 
                    controls 
                    className="w-full rounded-lg shadow-sm bg-gray-900"
                    style={{ maxHeight: '400px' }}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            )}

            {/* Report Section */}
            {isLoading && selectedInterview ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center justify-center space-x-4">
                  <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <div>
                    <p className="text-lg font-medium text-gray-900">Generating Report</p>
                    <p className="text-sm text-gray-500">Please wait while we analyze the session data...</p>
                  </div>
                </div>
              </div>
            ) : selectedReport ? (
              <ReportView report={selectedReport} />
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="max-w-md mx-auto">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Session Selected</h3>
                  <p className="text-gray-500">Select an interview session from the list to view its integrity report and video recording.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}