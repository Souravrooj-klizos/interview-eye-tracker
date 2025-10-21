'use client';

import React, { useRef, useState, useCallback } from 'react';
import { useEyeTracking } from '@/lib/hooks/useEyeTracking';
import { EyeTrackingResult } from '@/lib/types';

export default function TestPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const handleLookingAway = useCallback((result: EyeTrackingResult) => {
    const timestamp = new Date().toLocaleTimeString();
    const warning = `[${timestamp}] Looking away detected - Confidence: ${(result.confidence * 100).toFixed(1)}%`;
    setWarnings(prev => [warning, ...prev.slice(0, 9)]); // Keep last 10 warnings
    console.log('Eye tracking warning:', result);
  }, []);

  const { isTracking, startTracking, stopTracking, trackingMethod, error } = useEyeTracking(videoRef, handleLookingAway);

  const initializeCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsInitialized(true);
      }
    } catch (error) {
      console.error('Failed to access camera:', error);
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Eye Tracking Test</h1>
      
      {/* Status */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Status</h2>
        <p><strong>Initialized:</strong> {isInitialized ? 'Yes' : 'No'}</p>
        <p><strong>Tracking:</strong> {isTracking ? 'Active' : 'Inactive'}</p>
        <p><strong>Method:</strong> {trackingMethod || 'None'}</p>
        {error && <p className="text-red-600"><strong>Error:</strong> {error}</p>}
      </div>

      {/* Video */}
      <div className="mb-6">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full max-w-md mx-auto rounded-lg border"
        />
      </div>

      {/* Controls */}
      <div className="mb-6 flex gap-4 justify-center">
        <button
          onClick={initializeCamera}
          disabled={isInitialized}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Initialize Camera
        </button>
        <button
          onClick={startTracking}
          disabled={!isInitialized || isTracking}
          className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
        >
          Start Tracking
        </button>
        <button
          onClick={stopTracking}
          disabled={!isTracking}
          className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
        >
          Stop Tracking
        </button>
      </div>

      {/* Warnings */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Recent Warnings</h2>
        <div className="bg-gray-100 p-4 rounded-lg max-h-60 overflow-y-auto">
          {warnings.length === 0 ? (
            <p className="text-gray-500">No warnings yet. Try looking away from the camera or moving your head.</p>
          ) : (
            <ul className="space-y-1">
              {warnings.map((warning, index) => (
                <li key={index} className="text-sm text-red-600">
                  {warning}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Test Instructions</h2>
        <ol className="list-decimal list-inside space-y-1">
          <li>Click "Initialize Camera" to start the camera</li>
          <li>Click "Start Tracking" to begin eye tracking</li>
          <li>Try looking away from the camera - you should see warnings</li>
          <li>Try moving your head out of frame - you should see warnings</li>
          <li>Try blinking rapidly - you might see warnings</li>
          <li>Look directly at the camera - warnings should stop</li>
        </ol>
        
        <div className="mt-4 p-3 bg-yellow-100 rounded">
          <strong>Quick Test:</strong> If MediaPipe isn't working, try:
          <br />• Move your head completely out of frame for 2+ seconds
          <br />• Cover your face with your hands
          <br />• Look at a different direction for 3+ seconds
        </div>
      </div>
    </div>
  );
}