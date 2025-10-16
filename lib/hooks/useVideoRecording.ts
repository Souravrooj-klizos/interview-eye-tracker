'use client';

import { useCallback, useRef, useState } from 'react';

export const useVideoRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async (stream: MediaStream) => {
    try {
      // Clear previous recording
      chunksRef.current = [];
      setRecordedBlob(null);

      // Create MediaRecorder with optimal settings
      const options: MediaRecorderOptions = {
        mimeType: 'video/webm;codecs=vp9,opus',
      };

      // Fallback to other formats if vp9 not supported
      if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
        options.mimeType = 'video/webm;codecs=vp8,opus';
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
        options.mimeType = 'video/webm';
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
        options.mimeType = 'video/mp4';
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      streamRef.current = stream;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        setIsRecording(false);
        console.log('📹 Recording stopped, blob size:', blob.size);
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setIsRecording(false);
      };

      // Start recording with data chunks every 1 second
      mediaRecorder.start(1000);
      setIsRecording(true);
      
      console.log('🔴 Recording started with format:', options.mimeType);
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      
      // Stop all tracks in the stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
        });
      }
    }
  }, [isRecording]);

  const getRecordingDuration = useCallback(() => {
    if (!mediaRecorderRef.current) return 0;
    
    // This is an approximation - for precise timing, you'd need to track start time
    return chunksRef.current.length; // Each chunk is roughly 1 second
  }, []);

  const clearRecording = useCallback(() => {
    setRecordedBlob(null);
    chunksRef.current = [];
  }, []);

  return {
    isRecording,
    recordedBlob,
    startRecording,
    stopRecording,
    getRecordingDuration,
    clearRecording
  };
};
