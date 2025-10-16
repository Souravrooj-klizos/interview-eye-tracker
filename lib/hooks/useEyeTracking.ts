'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { EyeTrackingResult, MediaPipeResults } from '../types';

declare global {
  interface Window {
    FaceMesh: any;
    Camera: any;
  }
}

export const useEyeTracking = (
  videoRef: React.RefObject<HTMLVideoElement>,
  onLookingAway: (result: EyeTrackingResult) => void
) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const faceMeshRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const lastGazeRef = useRef({ x: 0, y: 0 });
  const lookAwayCountRef = useRef(0);

  // Eye landmark indices for MediaPipe FaceMesh
  const LEFT_EYE_LANDMARKS = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
  const RIGHT_EYE_LANDMARKS = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];

  const calculateGazeDirection = useCallback((landmarks: any[]) => {
    if (!landmarks || landmarks.length === 0) return { x: 0, y: 0 };

    try {
      // Get eye center points
      const leftEyeCenter = getEyeCenter(landmarks, LEFT_EYE_LANDMARKS);
      const rightEyeCenter = getEyeCenter(landmarks, RIGHT_EYE_LANDMARKS);
      
      // Get nose tip (landmark 1) as reference point
      const noseTip = landmarks[1];
      
      if (!leftEyeCenter || !rightEyeCenter || !noseTip) {
        return { x: 0, y: 0 };
      }

      // Calculate average eye position
      const eyeCenter = {
        x: (leftEyeCenter.x + rightEyeCenter.x) / 2,
        y: (leftEyeCenter.y + rightEyeCenter.y) / 2
      };

      // Calculate gaze direction relative to nose
      const gazeX = eyeCenter.x - noseTip.x;
      const gazeY = eyeCenter.y - noseTip.y;

      return { x: gazeX, y: gazeY };
    } catch (error) {
      console.warn('Error calculating gaze direction:', error);
      return { x: 0, y: 0 };
    }
  }, []);

  const getEyeCenter = (landmarks: any[], eyeLandmarks: number[]) => {
    try {
      let sumX = 0, sumY = 0;
      let validPoints = 0;

      for (const index of eyeLandmarks) {
        if (landmarks[index]) {
          sumX += landmarks[index].x;
          sumY += landmarks[index].y;
          validPoints++;
        }
      }

      if (validPoints === 0) return null;

      return {
        x: sumX / validPoints,
        y: sumY / validPoints
      };
    } catch (error) {
      return null;
    }
  };

  const isLookingAway = useCallback((gazeDirection: { x: number; y: number }) => {
    // Threshold for determining if user is looking away
    const GAZE_THRESHOLD = 0.15;
    
    const distance = Math.sqrt(gazeDirection.x ** 2 + gazeDirection.y ** 2);
    return distance > GAZE_THRESHOLD;
  }, []);

  const onResults = useCallback((results: MediaPipeResults) => {
    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      // No face detected - consider this as looking away
      lookAwayCountRef.current++;
      
      if (lookAwayCountRef.current > 3) { // Require multiple consecutive frames
        const result: EyeTrackingResult = {
          isLookingAway: true,
          confidence: 0.9,
          gazeDirection: { x: 0, y: 0 }
        };
        onLookingAway(result);
        lookAwayCountRef.current = 0;
      }
      return;
    }

    try {
      const landmarks = results.multiFaceLandmarks[0];
      const gazeDirection = calculateGazeDirection(landmarks);
      
      lastGazeRef.current = gazeDirection;
      
      const lookingAway = isLookingAway(gazeDirection);
      
      if (lookingAway) {
        lookAwayCountRef.current++;
      } else {
        lookAwayCountRef.current = Math.max(0, lookAwayCountRef.current - 1);
      }

      // Trigger callback if consistently looking away
      if (lookAwayCountRef.current > 5) {
        const result: EyeTrackingResult = {
          isLookingAway: true,
          confidence: Math.min(0.9, lookAwayCountRef.current / 10),
          gazeDirection
        };
        onLookingAway(result);
        lookAwayCountRef.current = 0;
      }
    } catch (error) {
      console.warn('Error processing face mesh results:', error);
    }
  }, [calculateGazeDirection, isLookingAway, onLookingAway]);

  const initializeFaceMesh = useCallback(async () => {
    if (!videoRef.current || isInitialized) return;

    try {
      // Wait for MediaPipe to be loaded
      if (!window.FaceMesh || !window.Camera) {
        console.warn('MediaPipe not loaded yet');
        return;
      }

      const faceMesh = new window.FaceMesh({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      faceMesh.onResults(onResults);
      faceMeshRef.current = faceMesh;

      const camera = new window.Camera(videoRef.current, {
        onFrame: async () => {
          if (faceMeshRef.current && isTracking) {
            await faceMeshRef.current.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480
      });

      cameraRef.current = camera;
      setIsInitialized(true);
      
      console.log('✅ Eye tracking initialized');
    } catch (error) {
      console.error('Failed to initialize eye tracking:', error);
    }
  }, [videoRef, isInitialized, onResults, isTracking]);

  const startTracking = useCallback(async () => {
    if (!isInitialized || !cameraRef.current) {
      await initializeFaceMesh();
      return;
    }

    try {
      setIsTracking(true);
      await cameraRef.current.start();
      console.log('👁️ Eye tracking started');
    } catch (error) {
      console.error('Failed to start eye tracking:', error);
    }
  }, [isInitialized, initializeFaceMesh]);

  const stopTracking = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.stop();
    }
    setIsTracking(false);
    lookAwayCountRef.current = 0;
    console.log('⏹️ Eye tracking stopped');
  }, []);

  // Load MediaPipe scripts
  useEffect(() => {
    const loadMediaPipe = async () => {
      if (window.FaceMesh && window.Camera) return;

      const scripts = [
        'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
        'https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js',
        'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
        'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js'
      ];

      for (const src of scripts) {
        if (!document.querySelector(`script[src="${src}"]`)) {
          const script = document.createElement('script');
          script.src = src;
          script.async = true;
          document.head.appendChild(script);
          
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
          });
        }
      }

      // Wait a bit for MediaPipe to initialize
      setTimeout(() => {
        initializeFaceMesh();
      }, 1000);
    };

    loadMediaPipe();
  }, [initializeFaceMesh]);

  return {
    isInitialized,
    isTracking,
    startTracking,
    stopTracking,
    currentGaze: lastGazeRef.current
  };
};
