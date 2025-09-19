// @ts-nocheck
import { useRef, useEffect, useState } from 'react';
import type { Alert } from '../App';
import { useProctoring } from '../hooks/useProctoring';
import { logEvent } from '../services/api';

// The import for axios was here. It has been removed.

interface VideoFeedProps {
  onNewAlert: (alert: Alert) => void;
  interviewId: string;
}

const VideoFeed = ({ onNewAlert, interviewId }: VideoFeedProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [cameraStatus, setCameraStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { isLoading, isProctoring, startProctoring, stopProctoring } = useProctoring(
    videoRef, 
    (alertData) => {
      const eventForBackend = {
        interviewId: interviewId,
        eventType: alertData.eventType,
        details: alertData.details,
      };
      logEvent(eventForBackend);
      const eventForUI = {
        timestamp: alertData.timestamp,
        message: alertData.message,
      };
      onNewAlert(eventForUI);
    }
  );

  useEffect(() => {
    const setupWebcam = async () => {
      try {
        setCameraStatus('connecting');
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480 }, 
          audio: true 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraStatus('connected');
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
        setCameraStatus('error');
      }
    };
    setupWebcam();
    
    return () => {
      stopProctoring();
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecordingTimer = () => {
    setRecordingDuration(0);
    recordingTimerRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
  };

  const stopRecordingTimer = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    startProctoring();
    setUploadStatus('idle');
    recordedChunksRef.current = [];
    setIsRecording(true);
    startRecordingTimer();
    
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const formData = new FormData();
        formData.append('video', blob, `interview-${interviewId}.webm`);

        setUploadStatus('uploading');
        try {
          // The global 'axios' from the CDN script will be used here
          const response = await axios.post(
            `http://localhost:5001/api/upload/${interviewId}`, 
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
          );
          console.log('Upload successful:', response.data);
          setUploadStatus('success');
        } catch (error) {
          console.error('Error uploading video:', error);
          setUploadStatus('error');
        }
      };

      mediaRecorderRef.current.start();
    }
  };

  const handleStop = () => {
    stopProctoring();
    setIsRecording(false);
    stopRecordingTimer();
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const getCameraStatusIcon = () => {
    switch (cameraStatus) {
      case 'connecting':
        return (
          <svg className="w-5 h-5 text-yellow-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'connected':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        );
    }
  };

  const getUploadStatusDisplay = () => {
    switch (uploadStatus) {
      case 'uploading':
        return (
          <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <svg className="w-4 h-4 text-blue-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-sm font-medium text-blue-700">Uploading recording...</span>
          </div>
        );
      case 'success':
        return (
          <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium text-green-700">Recording saved successfully!</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center space-x-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-red-700">Error saving recording.</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Video Container */}
      <div className="relative bg-gray-900 rounded-xl overflow-hidden shadow-inner">
        {/* Camera Status Overlay */}
        <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full">
          {getCameraStatusIcon()}
          <span className="text-sm font-medium text-white">
            {cameraStatus === 'connecting' && 'Connecting...'}
            {cameraStatus === 'connected' && 'Camera Active'}
            {cameraStatus === 'error' && 'Camera Error'}
          </span>
        </div>

        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-4 right-4 z-10 flex items-center space-x-2 px-3 py-1.5 bg-red-500/90 backdrop-blur-sm rounded-full">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-bold text-white">REC {formatDuration(recordingDuration)}</span>
          </div>
        )}

        {/* Proctoring Status */}
        {isProctoring && (
          <div className="absolute bottom-4 left-4 z-10 flex items-center space-x-2 px-3 py-1.5 bg-blue-500/90 backdrop-blur-sm rounded-full">
            <svg className="w-4 h-4 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm font-medium text-white">Monitoring Active</span>
          </div>
        )}

        {/* Video Element */}
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="w-full aspect-video object-cover bg-gray-800" 
        />

        {/* Camera Error State */}
        {cameraStatus === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-center text-white space-y-4">
              <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold mb-2">Camera Access Required</h3>
                <p className="text-sm text-gray-300">Please allow camera access to continue with the proctored session.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button 
          onClick={handleStart} 
          disabled={isProctoring || isLoading || cameraStatus !== 'connected'}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl min-w-[160px]"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </>
          ) : isProctoring ? (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Session Active
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a2.5 2.5 0 100-5H9c0 1.465 0 2.5 0 5zm1.5 0V9a1.5 1.5 0 113 0v1M12 16v4" />
              </svg>
              Start Proctoring
            </>
          )}
        </button>

        <button 
          onClick={handleStop} 
          disabled={!isProctoring || isLoading}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl min-w-[160px]"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10h6v4H9z" />
          </svg>
          Stop Session
        </button>
      </div>

      {/* Status Display */}
      <div className="flex justify-center">
        {getUploadStatusDisplay()}
      </div>

      {/* Technical Info */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Session ID:</span>
          <span className="font-mono text-gray-900">{interviewId.slice(-12)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Camera Status:</span>
          <span className={`font-medium ${
            cameraStatus === 'connected' ? 'text-green-600' : 
            cameraStatus === 'connecting' ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {cameraStatus.charAt(0).toUpperCase() + cameraStatus.slice(1)}
          </span>
        </div>
        {isRecording && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Recording Duration:</span>
            <span className="font-mono text-gray-900">{formatDuration(recordingDuration)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoFeed;