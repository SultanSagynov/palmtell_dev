"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Upload, X, CheckCircle, AlertCircle } from "lucide-react";
import { useMediaPipeHands } from "@/hooks/use-mediapipe-hands";
import Image from "next/image";

interface PalmUploadProps {
  profileId: string;
  onUploadSuccess: (readingId: string) => void;
  onUploadError: (error: string) => void;
}

export function PalmUpload({ profileId, onUploadSuccess, onUploadError }: PalmUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [cameraAvailable, setCameraAvailable] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { validateHandInImage, captureFromCamera, isLoading: isCapturing, error: cameraError, cleanup } = useMediaPipeHands();

  // Check camera availability on mount
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const hasCamera = devices.some(device => device.kind === 'videoinput');
          setCameraAvailable(hasCamera);
        })
        .catch(() => {
          setCameraAvailable(false);
        });
    } else {
      setCameraAvailable(false);
    }

    return () => {
      cleanup();
    };
  }, [cleanup]);

  const handleFileSelect = useCallback(async (file: File) => {
    setUploadError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setValidationStatus('validating');

    // Validate hand presence
    const result = await validateHandInImage(file);
    setValidationStatus(result.handsDetected ? 'valid' : 'invalid');
  }, [validateHandInImage]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setUploadError('Please select a valid image file.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('Image file is too large. Maximum size is 10MB.');
        return;
      }
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setUploadError(null);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    } else {
      setUploadError('Please drag and drop a valid image file.');
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleCameraCapture = useCallback(async () => {
    setUploadError(null);
    const file = await captureFromCamera();
    if (file) {
      handleFileSelect(file);
    } else if (cameraError) {
      setUploadError(cameraError);
    }
  }, [captureFromCamera, handleFileSelect, cameraError]);

  const handleUpload = useCallback(async () => {
    if (!selectedFile || validationStatus !== 'valid') {
      setUploadError('Please select a valid palm image with a hand detected.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('profileId', profileId);

      const response = await fetch('/api/readings', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Upload failed (${response.status})`);
      }

      if (!data.reading?.id) {
        throw new Error('Invalid response from server');
      }

      onUploadSuccess(data.reading.id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadError(errorMessage);
      onUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, validationStatus, profileId, onUploadSuccess, onUploadError]);

  const clearSelection = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setValidationStatus('idle');
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const getValidationIcon = () => {
    switch (validationStatus) {
      case 'validating':
        return <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />;
      case 'valid':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'invalid':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getValidationMessage = () => {
    switch (validationStatus) {
      case 'validating':
        return 'Detecting hand in image...';
      case 'valid':
        return 'Hand detected! Ready to analyze.';
      case 'invalid':
        return 'No hand detected. Please upload a clear palm photo.';
      default:
        return null;
    }
  };

  return (
    <Card className="border-border/40">
      <CardHeader>
        <CardTitle>Upload Palm Photo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!selectedFile ? (
          <div
            className="flex flex-col items-center rounded-lg border-2 border-dashed border-border/60 bg-muted/20 py-16 transition-colors hover:border-border/80"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Upload className="h-8 w-8" />
            </div>
            <p className="mt-4 text-sm font-medium">
              Drag & drop your palm photo here
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              JPG, PNG, WEBP, or HEIC up to 10MB
            </p>
            <div className="mt-6 flex gap-3">
              <Button
                className="gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                Choose File
              </Button>
              {cameraAvailable ? (
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={handleCameraCapture}
                  disabled={isCapturing}
                >
                  <Camera className="h-4 w-4" />
                  {isCapturing ? 'Opening Camera...' : 'Take Photo'}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  disabled
                  title="Camera not available on this device"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Camera Not Available
                </Button>
              )}
            </div>
            {uploadError && (
              <div className="mt-4 flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg w-full max-w-sm">
                <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{uploadError}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                <Image
                  src={previewUrl!}
                  alt="Palm preview"
                  fill
                  className="object-contain"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="absolute right-2 top-2"
                onClick={clearSelection}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {validationStatus !== 'idle' && (
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
                {getValidationIcon()}
                <span className="text-sm">{getValidationMessage()}</span>
              </div>
            )}

            {uploadError && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{uploadError}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleUpload}
                disabled={validationStatus !== 'valid' || isUploading}
                className="flex-1"
              >
                {isUploading ? 'Analyzing...' : 'Start Analysis'}
              </Button>
              <Button variant="outline" onClick={clearSelection} disabled={isUploading}>
                Choose Different Photo
              </Button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          onChange={handleFileChange}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
}
