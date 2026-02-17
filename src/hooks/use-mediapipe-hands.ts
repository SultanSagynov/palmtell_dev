"use client";

import { useCallback, useRef, useState } from "react";

interface HandDetectionResult {
  handsDetected: boolean;
  confidence: number;
}

export function useMediaPipeHands() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const validateHandInImage = useCallback(async (imageFile: File): Promise<HandDetectionResult> => {
    setIsLoading(true);
    setError(null);

    try {
      // Basic file validation
      if (!imageFile.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      // Check file size (10MB max)
      const maxFileSize = 10 * 1024 * 1024;
      if (imageFile.size > maxFileSize) {
        throw new Error('Image file is too large. Maximum size is 10MB.');
      }

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));

      // TODO: Implement actual MediaPipe Hands detection
      // For now, return a mock positive result for development
      return {
        handsDetected: true,
        confidence: 0.95
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Hand detection failed';
      setError(errorMessage);
      return {
        handsDetected: false,
        confidence: 0
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const captureFromCamera = useCallback(async (): Promise<File | null> => {
    setIsLoading(true);
    setError(null);

    let stream: MediaStream | null = null;

    try {
      // Request camera access with error handling
      stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      }).catch((err) => {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          throw new Error('Camera permission denied. Please allow camera access in your browser settings.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          throw new Error('No camera device found. Please ensure your device has a camera.');
        } else if (err.name === 'NotReadableError') {
          throw new Error('Camera is in use by another application. Please close other apps using your camera.');
        }
        throw err;
      });

      streamRef.current = stream;

      return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.srcObject = stream;
        video.autoplay = true;
        video.playsInline = true;

        // Add timeout to prevent hanging
        const timeoutId = setTimeout(() => {
          stream?.getTracks().forEach(track => track.stop());
          reject(new Error('Camera capture timeout. Please try again.'));
        }, 10000);

        video.onloadedmetadata = () => {
          try {
            clearTimeout(timeoutId);
            
            // Add delay to ensure video frame is ready
            setTimeout(() => {
              const canvas = document.createElement('canvas');
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              
              const ctx = canvas.getContext('2d');
              if (!ctx) {
                throw new Error('Failed to get canvas context');
              }

              ctx.drawImage(video, 0, 0);
              
              // Stop the stream
              stream?.getTracks().forEach(track => track.stop());
              streamRef.current = null;
              
              canvas.toBlob((blob) => {
                if (blob) {
                  const file = new File([blob], 'palm-photo.jpg', { type: 'image/jpeg' });
                  resolve(file);
                } else {
                  reject(new Error('Failed to capture image from camera'));
                }
              }, 'image/jpeg', 0.9);
            }, 500);
          } catch (err) {
            stream?.getTracks().forEach(track => track.stop());
            reject(err);
          }
        };

        video.onerror = () => {
          stream?.getTracks().forEach(track => track.stop());
          reject(new Error('Failed to load camera stream'));
        };
      });
    } catch (err) {
      // Clean up stream on error
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      streamRef.current = null;

      const errorMessage = err instanceof Error ? err.message : 'Camera capture failed';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  return {
    validateHandInImage,
    captureFromCamera,
    isLoading,
    error,
    cleanup,
  };
}
