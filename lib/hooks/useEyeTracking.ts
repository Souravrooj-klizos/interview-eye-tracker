'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { EyeTrackingResult, MediaPipeResults } from '../types';

declare global {
  interface Window {
    FaceMesh: any;
    Camera: any;
    cv: any;
    tf: any;
  }
}

export const useEyeTracking = (
  videoRef: { current: HTMLVideoElement | null },
  onLookingAway: (result: EyeTrackingResult) => void
) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingMethod, setTrackingMethod] = useState<'mediapipe' | 'opencv' | 'fallback' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const faceMeshRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const lastGazeRef = useRef({ x: 0, y: 0 });
  const lookAwayCountRef = useRef(0);
  const noFaceCountRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

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
    // More sensitive threshold for better detection
    const GAZE_THRESHOLD = 0.05;
    
    const distance = Math.sqrt(gazeDirection.x ** 2 + gazeDirection.y ** 2);
    return distance > GAZE_THRESHOLD;
  }, []);

  const onResults = useCallback((results: MediaPipeResults) => {
    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      // No face detected - consider this as looking away
      noFaceCountRef.current++;
      lookAwayCountRef.current++;
      
      // More sensitive to no face detection
      if (noFaceCountRef.current > 2) {
        const result: EyeTrackingResult = {
          isLookingAway: true,
          confidence: 0.95,
          gazeDirection: { x: 0, y: 0 }
        };
        onLookingAway(result);
        noFaceCountRef.current = 0;
        lookAwayCountRef.current = 0;
      }
      return;
    }

    // Reset no face counter when face is detected
    noFaceCountRef.current = 0;

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

      // More sensitive triggering - reduced threshold
      if (lookAwayCountRef.current > 1) {
        const result: EyeTrackingResult = {
          isLookingAway: true,
          confidence: Math.min(0.95, lookAwayCountRef.current / 3),
          gazeDirection
        };
        onLookingAway(result);
        lookAwayCountRef.current = 0;
      }
    } catch (error) {
      console.warn('Error processing face mesh results:', error);
      // Treat errors as looking away
      noFaceCountRef.current++;
    }
  }, [calculateGazeDirection, isLookingAway, onLookingAway]);

  // Fallback OpenCV-based eye tracking
  const initializeOpenCV = useCallback(async () => {
    if (!videoRef.current || !window.cv) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      canvasRef.current = canvas;
      const ctx = canvas.getContext('2d');

      const processFrame = () => {
        if (!videoRef.current || !ctx || !isTracking) return;

        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Simple face detection using OpenCV
        const src = window.cv.matFromImageData(imageData);
        const gray = new window.cv.Mat();
        const faces = new window.cv.RectVector();
        const faceCascade = new window.cv.CascadeClassifier();
        
        // Load Haar cascade for face detection
        faceCascade.load('haarcascade_frontalface_alt.xml');
        
        window.cv.cvtColor(src, gray, window.cv.COLOR_RGBA2GRAY);
        faceCascade.detectMultiScale(gray, faces, 1.1, 3, 0);
        
        if (faces.size() === 0) {
          // No face detected
          noFaceCountRef.current++;
          if (noFaceCountRef.current > 3) {
            const result: EyeTrackingResult = {
              isLookingAway: true,
              confidence: 0.9,
              gazeDirection: { x: 0, y: 0 }
            };
            onLookingAway(result);
            noFaceCountRef.current = 0;
          }
        } else {
          noFaceCountRef.current = 0;
        }

        src.delete();
        gray.delete();
        faces.delete();
        faceCascade.delete();
      };

      const startOpenCVTracking = () => {
        const frame = () => {
          processFrame();
          if (isTracking) {
            animationFrameRef.current = requestAnimationFrame(frame);
          }
        };
        frame();
      };

      setTrackingMethod('opencv');
      setIsInitialized(true);
      startOpenCVTracking();
      
      console.log('✅ OpenCV eye tracking initialized');
    } catch (error) {
      console.error('Failed to initialize OpenCV eye tracking:', error);
      setError('OpenCV initialization failed');
    }
  }, [videoRef, isTracking, onLookingAway]);

  // Simple fallback tracking using basic motion detection and face detection
  const initializeFallback = useCallback(() => {
    if (!videoRef.current) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 240;
      canvasRef.current = canvas;
      const ctx = canvas.getContext('2d');
      
      let lastFrame: ImageData | null = null;
      let motionCount = 0;
      let noMotionCount = 0;
      let lastMotionTime = 0;
      let noFaceCount = 0;
      let lastFaceTime = 0;

      // Simple face detection using skin tone detection
      const detectFace = (imageData: ImageData) => {
        const data = imageData.data;
        let skinPixels = 0;
        let totalPixels = 0;
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Simple skin tone detection
          if (r > 95 && g > 40 && b > 20 && 
              Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
              Math.abs(r - g) > 15 && r > g && r > b) {
            skinPixels++;
          }
          totalPixels++;
        }
        
        return (skinPixels / totalPixels) > 0.1; // At least 10% skin pixels
      };

      const processFrame = () => {
        if (!videoRef.current || !ctx || !isTracking) return;

        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const currentTime = Date.now();
        
        // Face detection
        const hasFace = detectFace(currentFrame);
        
        if (!hasFace) {
          noFaceCount++;
          if (noFaceCount > 5) { // No face for 5 consecutive frames
            const result: EyeTrackingResult = {
              isLookingAway: true,
              confidence: 0.9,
              gazeDirection: { x: 0, y: 0 }
            };
            onLookingAway(result);
            noFaceCount = 0;
          }
        } else {
          noFaceCount = 0;
          lastFaceTime = currentTime;
        }
        
        if (lastFrame) {
          // Simple motion detection
          let diff = 0;
          for (let i = 0; i < currentFrame.data.length; i += 4) {
            const rDiff = Math.abs(currentFrame.data[i] - lastFrame.data[i]);
            const gDiff = Math.abs(currentFrame.data[i + 1] - lastFrame.data[i + 1]);
            const bDiff = Math.abs(currentFrame.data[i + 2] - lastFrame.data[i + 2]);
            diff += (rDiff + gDiff + bDiff) / 3;
          }
          
          const motionThreshold = 30000; // More sensitive
          
          if (diff > motionThreshold) {
            motionCount++;
            lastMotionTime = currentTime;
            noMotionCount = 0;
          } else {
            noMotionCount++;
            motionCount = Math.max(0, motionCount - 1);
          }
          
          // If no motion for too long, consider looking away
          if (noMotionCount > 15 && (currentTime - lastMotionTime) > 3000) {
            const result: EyeTrackingResult = {
              isLookingAway: true,
              confidence: 0.7,
              gazeDirection: { x: 0, y: 0 }
            };
            onLookingAway(result);
            noMotionCount = 0;
          }
          
          // If too much motion, also consider looking away (head movement)
          if (motionCount > 5) {
            const result: EyeTrackingResult = {
              isLookingAway: true,
              confidence: 0.5,
              gazeDirection: { x: 0, y: 0 }
            };
            onLookingAway(result);
            motionCount = 0;
          }
        }
        
        lastFrame = currentFrame;
        
        if (isTracking) {
          animationFrameRef.current = requestAnimationFrame(processFrame);
        }
      };

      setTrackingMethod('fallback');
      setIsInitialized(true);
      
      // Start processing immediately
      const startFallbackTracking = () => {
        processFrame();
      };
      
      startFallbackTracking();
      
      console.log('✅ Fallback eye tracking initialized');
      console.log('Fallback tracking will detect:');
      console.log('- No face in frame (looking away)');
      console.log('- Too much motion (head movement)');
      console.log('- No motion for too long (staring away)');
    } catch (error) {
      console.error('Failed to initialize fallback tracking:', error);
      setError('Fallback tracking failed');
    }
  }, [videoRef, isTracking, onLookingAway]);

  const initializeFaceMesh = useCallback(async () => {
    if (!videoRef.current || isInitialized) return;

    try {
      // Wait for MediaPipe to be loaded
      if (!window.FaceMesh || !window.Camera) {
        console.warn('MediaPipe not loaded yet, trying fallback...');
        await initializeOpenCV();
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
        minDetectionConfidence: 0.3, // Lower threshold for better detection
        minTrackingConfidence: 0.3
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
      setTrackingMethod('mediapipe');
      setIsInitialized(true);
      
      console.log('✅ MediaPipe eye tracking initialized');
      
      // Auto-start the camera if tracking is already requested
      if (isTracking) {
        console.log('Auto-starting MediaPipe camera...');
        await camera.start();
      }
    } catch (error) {
      console.error('Failed to initialize MediaPipe eye tracking:', error);
      setError('MediaPipe initialization failed, trying fallback...');
      await initializeOpenCV();
    }
  }, [videoRef, isInitialized, onResults, isTracking, initializeOpenCV]);

  const startTracking = useCallback(async () => {
    try {
      setError(null);
      
      // If not initialized, initialize first
      if (!isInitialized) {
        console.log('Initializing eye tracking...');
        await initializeFaceMesh();
        // Wait a bit for initialization to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setIsTracking(true);
      
      if (trackingMethod === 'mediapipe' && cameraRef.current) {
        console.log('Starting MediaPipe camera...');
        await cameraRef.current.start();
        console.log('✅ MediaPipe camera started');
      } else if (trackingMethod === 'opencv' || trackingMethod === 'fallback') {
        // Animation frame tracking is already started in initialization
        console.log('👁️ Eye tracking started with', trackingMethod);
      } else {
        console.warn('No tracking method available, trying fallback...');
        initializeFallback();
      }
      
      console.log('👁️ Eye tracking started');
    } catch (error) {
      console.error('Failed to start eye tracking:', error);
      setError('Failed to start eye tracking');
      
      // Try fallback if main method fails
      if (trackingMethod === 'mediapipe') {
        console.log('MediaPipe failed, trying fallback tracking...');
        initializeFallback();
      }
    }
  }, [isInitialized, initializeFaceMesh, trackingMethod, initializeFallback]);

  const stopTracking = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.stop();
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    setIsTracking(false);
    lookAwayCountRef.current = 0;
    noFaceCountRef.current = 0;
    console.log('⏹️ Eye tracking stopped');
  }, []);

  // Load required scripts
  useEffect(() => {
    const loadScripts = async () => {
      try {
        // Check if fallback is forced (from URL params or localStorage)
        const urlParams = new URLSearchParams(window.location.search);
        const forceFallback = urlParams.get('fallback') === 'true' || localStorage.getItem('forceFallback') === 'true';
        
        if (forceFallback) {
          console.log('Fallback mode forced, skipping MediaPipe...');
          initializeFallback();
          return;
        }
        
        // Try to load MediaPipe first
        if (!window.FaceMesh || !window.Camera) {
          const mediaPipeScripts = [
            'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
            'https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js',
            'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
            'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js'
          ];

          for (const src of mediaPipeScripts) {
            if (!document.querySelector(`script[src="${src}"]`)) {
              const script = document.createElement('script');
              script.src = src;
              script.async = true;
              script.crossOrigin = 'anonymous';
              document.head.appendChild(script);
              
              await new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = () => {
                  console.warn(`Failed to load ${src}`);
                  resolve(null);
                };
              });
            }
          }
        }

        // Wait for MediaPipe to initialize
        setTimeout(async () => {
          if (window.FaceMesh && window.Camera) {
            await initializeFaceMesh();
          } else {
            console.warn('MediaPipe failed to load, trying OpenCV...');
            
            // Try OpenCV as fallback
            if (!window.cv) {
              const opencvScript = document.createElement('script');
              opencvScript.src = 'https://docs.opencv.org/4.8.0/opencv.js';
              opencvScript.async = true;
              opencvScript.onload = () => {
                console.log('OpenCV loaded, initializing...');
                initializeOpenCV();
              };
              opencvScript.onerror = () => {
                console.warn('OpenCV failed to load, using fallback tracking...');
                initializeFallback();
              };
              document.head.appendChild(opencvScript);
            } else {
              await initializeOpenCV();
            }
          }
        }, 2000);
      } catch (error) {
        console.error('Failed to load tracking libraries:', error);
        setError('Failed to load eye tracking libraries');
        initializeFallback();
      }
    };

    loadScripts();
  }, [initializeFaceMesh, initializeOpenCV, initializeFallback]);

  return {
    isInitialized,
    isTracking,
    startTracking,
    stopTracking,
    currentGaze: lastGazeRef.current,
    trackingMethod,
    error
  };
};
