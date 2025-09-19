// We can use the global axios from the CDN, but we need to declare its type for TypeScript
declare const axios: any;

import type {ReportData } from '../types';
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Define a type for the event data we send
interface EventPayload {
  interviewId: string;
  eventType: string;
  details?: any;
}

export const logEvent = async (eventData: EventPayload): Promise<void> => {
  try {
    const payload = {
      ...eventData,
      timestamp: new Date().toISOString(),
    };
    await apiClient.post('/events', payload);
  } catch (error: any) {
    console.error('Error logging event:', error.response ? error.response.data : error.message);
  }
};

export const getReport = async (interviewId: string): Promise<ReportData | null> => {
  try {
    const response = await apiClient.get(`/report/${interviewId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching report:', error.response ? error.response.data : error.message);
    return null;
  }
};
// ... (keep existing code at the top)

// Define a type for user credentials
interface Credentials {
  email: string;
  password: string;
  role?: 'interviewer' | 'candidate';
}

interface AuthResponse {
  token: string;
}

export const registerUser = async (credentials: Credentials): Promise<AuthResponse | null> => {
  try {
    const response = await apiClient.post('/auth/register', credentials);
    return response.data;
  } catch (error: any) {
    console.error('Registration error:', error.response ? error.response.data : error.message);
    return null;
  }
};

export const loginUser = async (credentials: Credentials): Promise<AuthResponse | null> => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  } catch (error: any) {
    console.error('Login error:', error.response ? error.response.data : error.message);
    return null;
  }
};
export const getInterviews = async (): Promise<string[] | null> => {
  try {
    const response = await apiClient.get('/interviews');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching interviews:', error.response ? error.response.data : error.message);
    return null;
  }
};