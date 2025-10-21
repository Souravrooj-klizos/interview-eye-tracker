'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useEyeTracking } from '@/lib/hooks/useEyeTracking';
import { useVideoRecording } from '@/lib/hooks/useVideoRecording';
import { EyeTrackingResult, InterviewSession } from '@/lib/types';

interface Warning {
  time: number;
  reason: string;
}

export default function InterviewRecorder() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [interviewSession, setInterviewSession] = useState<InterviewSession | null>(null);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [showWarning, setShowWarning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  const [forceFallback, setForceFallback] = useState(false);
  const [userId] = useState(() => `user_${Date.now()}`); // Simple user ID generation

  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastWarningTimeRef = useRef(0);

  const { isRecording, recordedBlob, startRecording, stopRecording } = useVideoRecording();

  const handleLookingAway = useCallback(async (result: EyeTrackingResult) => {
    if (!interviewSession || !result.isLookingAway) return;

    const currentTime = Date.now();
    const timeSinceLastWarning = currentTime - lastWarningTimeRef.current;

    // Throttle warnings to avoid spam (minimum 3 seconds between warnings)
    if (timeSinceLastWarning < 3000) return;

    lastWarningTimeRef.current = currentTime;

    // Show warning banner
    setShowWarning(true);
    
    // Clear existing timeout
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Hide warning after 3 seconds
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(false);
    }, 3000);

    // Log warning to database
    try {
      const warningData = {
        interviewId: interviewSession.id,
        time: currentTime - interviewSession.startedAt.getTime(),
        reason: 'Looking away from screen'
      };

      const response = await fetch('/api/warning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(warningData),
      });

      if (response.ok) {
        setWarnings(prev => [...prev, warningData]);
        console.log('⚠️ Warning logged:', warningData);
      }
    } catch (error) {
      console.error('Failed to log warning:', error);
    }
  }, [interviewSession]);

  const { isTracking, startTracking, stopTracking, trackingMethod, error: trackingError } = useEyeTracking(videoRef, handleLookingAway);

  const initializeCamera = useCallback(async () => {
    try {
      setError(null);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
      });

      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      return mediaStream;
    } catch (error) {
      console.error('Failed to access camera:', error);
      setError('Failed to access camera. Please ensure you have granted camera and microphone permissions.');
      throw error;
    }
  }, []);

  const startInterview = useCallback(async () => {
    try {
      setError(null);
      setUploadProgress('Initializing...');

      // Initialize camera if not already done
      let mediaStream = stream;
      if (!mediaStream) {
        mediaStream = await initializeCamera();
      }

      // Start interview session
      const response = await fetch('/api/interview/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to start interview session');
      }

      const data = await response.json();
      const session: InterviewSession = {
        id: data.interviewId,
        userId,
        startedAt: new Date(data.startedAt),
        status: 'active'
      };

      setInterviewSession(session);
      setWarnings([]);
      setUploadProgress('');

      // Start recording
      await startRecording(mediaStream);

      // Start eye tracking
      await startTracking();
      
      // If tracking failed, try fallback after a delay
      setTimeout(async () => {
        if (!isTracking) {
          console.log('MediaPipe failed, trying fallback...');
          setForceFallback(true);
          // Force reinitialize with fallback
          window.location.reload();
        }
      }, 5000);

      console.log('🎬 Interview started:', session);
    } catch (error) {
      console.error('Failed to start interview:', error);
      setError('Failed to start interview. Please try again.');
      setUploadProgress('');
    }
  }, [stream, userId, startRecording, startTracking, initializeCamera]);

  const endInterview = useCallback(async () => {
    try {
      setUploadProgress('Stopping recording...');

      // Stop recording and eye tracking
      stopRecording();
      stopTracking();

      // Clear warning timeout
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      setShowWarning(false);

      if (!interviewSession) return;

      // End interview session
      await fetch('/api/interview/end', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ interviewId: interviewSession.id }),
      });

      console.log('⏹️ Interview ended');
    } catch (error) {
      console.error('Failed to end interview:', error);
      setError('Failed to end interview properly.');
    }
  }, [stopRecording, stopTracking, interviewSession]);

  // Upload video when recording is complete
  useEffect(() => {
    const uploadVideo = async () => {
      if (!recordedBlob || !interviewSession) return;

      try {
        setIsUploading(true);
        setUploadProgress('Uploading video...');

        const formData = new FormData();
        formData.append('video', recordedBlob, `interview_${interviewSession.id}.webm`);
        formData.append('interviewId', interviewSession.id);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload video');
        }

        const data = await response.json();
        setUploadProgress(`Upload complete! Video saved: ${data.fileName}`);
        
        console.log('✅ Video uploaded:', data);
        
        // Reset session
        setTimeout(() => {
          setInterviewSession(null);
          setUploadProgress('');
          setIsUploading(false);
        }, 3000);

      } catch (error) {
        console.error('Failed to upload video:', error);
        setError('Failed to upload video. Please try again.');
        setIsUploading(false);
        setUploadProgress('');
      }
    };

    uploadVideo();
  }, [recordedBlob, interviewSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [stream]);

  const isActive = interviewSession?.status === 'active';

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Interview Eye Tracker</h1>
          <p className="text-primary-100 mt-1">
            Professional interview recording with real-time eye tracking
          </p>
        </div>

        {/* Warning Banner */}
        {showWarning && (
          <div className="warning-banner mx-6 mt-4">
            <span className="text-xl">⚠️</span>
            <span className="font-semibold">Please look at the screen</span>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="bg-danger-50 border border-danger-200 text-danger-800 px-6 py-3 mx-6 mt-4 rounded-lg">
            <span className="font-semibold">Error:</span> {error}
          </div>
        )}

        {/* Tracking Error Banner */}
        {trackingError && (
          <div className="bg-warning-50 border border-warning-200 text-warning-800 px-6 py-3 mx-6 mt-4 rounded-lg">
            <span className="font-semibold">Tracking Warning:</span> {trackingError}
          </div>
        )}

        {/* Video Preview */}
        <div className="p-6">
          <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-6">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-64 sm:h-80 object-cover"
            />
            
            {/* Recording Indicator */}
            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-danger-600 text-white px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Recording</span>
              </div>
            )}

            {/* Eye Tracking Status */}
            {isActive && (
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-primary-600 text-white px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm font-medium">
                  {isTracking ? `Eye Tracking (${trackingMethod || 'Unknown'})` : 'Initializing...'}
                </span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            {!isActive ? (
              <button
                onClick={startInterview}
                disabled={isUploading}
                className="btn-primary flex items-center gap-2 text-lg px-8"
              >
                <span>▶️</span>
                Start Interview
              </button>
            ) : (
              <button
                onClick={endInterview}
                disabled={isUploading}
                className="btn-danger flex items-center gap-2 text-lg px-8"
              >
                <span>⏹️</span>
                End Interview
              </button>
            )}
          </div>

          {/* Progress */}
          {uploadProgress && (
            <div className="mt-4 text-center">
              <p className="text-primary-600 font-medium">{uploadProgress}</p>
              {isUploading && (
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary-600 h-2 rounded-full animate-pulse w-1/2"></div>
                </div>
              )}
            </div>
          )}

          {/* Session Info */}
          {isActive && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-primary-600">{warnings.length}</div>
                <div className="text-sm text-gray-600">Warnings</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-primary-600">
                  {isTracking ? '👁️' : '⏳'}
                </div>
                <div className="text-sm text-gray-600">Eye Tracking</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-primary-600">
                  {isRecording ? '🔴' : '⚪'}
                </div>
                <div className="text-sm text-gray-600">Recording</div>
              </div>
            </div>
          )}

          {/* Debug Panel */}
          {debugMode && (
            <div className="mt-6 bg-gray-100 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Debug Information</h3>
                <button
                  onClick={() => setDebugMode(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Hide Debug
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Tracking Method:</strong> {trackingMethod || 'None'}
                </div>
                <div>
                  <strong>Is Tracking:</strong> {isTracking ? 'Yes' : 'No'}
                </div>
                <div>
                  <strong>Camera Stream:</strong> {stream ? 'Active' : 'Inactive'}
                </div>
                <div>
                  <strong>Video Element:</strong> {videoRef.current ? 'Ready' : 'Not Ready'}
                </div>
                {trackingError && (
                  <div className="col-span-2">
                    <strong>Tracking Error:</strong> {trackingError}
                  </div>
                )}
                <div className="col-span-2">
                  <button
                    onClick={() => {
                      console.log('Forcing fallback mode...');
                      localStorage.setItem('forceFallback', 'true');
                      window.location.reload();
                    }}
                    className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                  >
                    Force Fallback Mode
                  </button>
                  <button
                    onClick={() => {
                      console.log('Resetting to MediaPipe...');
                      localStorage.removeItem('forceFallback');
                      window.location.reload();
                    }}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 ml-2"
                  >
                    Reset to MediaPipe
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Debug Toggle */}
          <div className="mt-4 text-center">
            <button
              onClick={() => setDebugMode(!debugMode)}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              {debugMode ? 'Hide Debug Info' : 'Show Debug Info'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <p className="text-sm text-gray-600 text-center">
            This application uses MediaPipe for real-time eye tracking and records your interview session.
            <br />
            Make sure you have a stable internet connection and good lighting for optimal performance.
          </p>
        </div>
      </div>
    </div>
  );
}
