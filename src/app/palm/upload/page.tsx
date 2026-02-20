"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMediaPipeHands } from "@/hooks/use-mediapipe-hands";
import { Hand, Upload, Camera, AlertCircle, Calendar } from "lucide-react";
import { DISCLAIMER } from "@/lib/constants";

export default function PalmUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dob, setDob] = useState({ day: "", month: "", year: "" });
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const router = useRouter();
  const { captureFromCamera, validateHandInImage, isLoading, error: cameraError } = useMediaPipeHands();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError("Please select a valid image file");
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image file is too large. Maximum size is 10MB");
      return;
    }

    // Client-side hand validation
    const validation = await validateHandInImage(file);
    if (!validation.handsDetected) {
      setError("No hand detected in the image. Please upload a clear photo of your palm");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleCameraCapture = async () => {
    setError(null);
    
    try {
      const capturedFile = await captureFromCamera();
      if (capturedFile) {
        setSelectedFile(capturedFile);
        setPreviewUrl(URL.createObjectURL(capturedFile));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to capture photo");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError("Please select or capture a palm photo");
      return;
    }

    if (!dob.day || !dob.month || !dob.year) {
      setError("Please enter your complete date of birth");
      return;
    }

    // Validate date
    const birthDate = new Date(parseInt(dob.year), parseInt(dob.month) - 1, parseInt(dob.day));
    if (isNaN(birthDate.getTime()) || birthDate > new Date()) {
      setError("Please enter a valid date of birth");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('dob', birthDate.toISOString());

      const response = await fetch('/api/palm/submit', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to confirmation page
        router.push('/palm/confirm');
      } else {
        setError(data.error || 'Failed to upload palm data');
      }
    } catch (err) {
      setError('Failed to upload palm data. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Hand className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-3xl font-bold">Setup Your Palm Reading</h1>
              <p className="text-muted-foreground mt-2">
                Upload your palm photo and birth date to get started
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Palm Photo */}
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hand className="h-5 w-5" />
                  Step 1: Palm Photo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selectedFile ? (
                  <div className="space-y-4">
                    {/* Upload Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="file-upload" className="sr-only">
                          Upload palm photo
                        </Label>
                        <Input
                          id="file-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-24 flex flex-col gap-2"
                          onClick={() => document.getElementById('file-upload')?.click()}
                        >
                          <Upload className="h-6 w-6" />
                          Choose File
                        </Button>
                      </div>
                      
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-24 flex flex-col gap-2"
                        onClick={handleCameraCapture}
                        disabled={isLoading}
                      >
                        <Camera className="h-6 w-6" />
                        {isLoading ? "Opening Camera..." : "Take Photo"}
                      </Button>
                    </div>

                    {/* Photo Tips */}
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-medium mb-2">Photo Tips:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Open your hand fully with palm facing camera</li>
                        <li>• Use good lighting, avoid shadows</li>
                        <li>• Ensure palm lines are clearly visible</li>
                        <li>• Hold hand steady and flat</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Preview */}
                    <div className="relative">
                      <img
                        src={previewUrl!}
                        alt="Palm preview"
                        className="w-full max-w-sm mx-auto rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                      >
                        Change Photo
                      </Button>
                    </div>
                  </div>
                )}

                {cameraError && (
                  <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-destructive">{cameraError}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 2: Date of Birth */}
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Step 2: Date of Birth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    We need this for horoscope insights and personalized readings
                  </p>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="day">Day</Label>
                      <select
                        id="day"
                        value={dob.day}
                        onChange={(e) => setDob(prev => ({ ...prev, day: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                      >
                        <option value="">Day</option>
                        {days.map(day => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="month">Month</Label>
                      <select
                        id="month"
                        value={dob.month}
                        onChange={(e) => setDob(prev => ({ ...prev, month: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                      >
                        <option value="">Month</option>
                        {months.map(month => (
                          <option key={month.value} value={month.value}>{month.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="year">Year</Label>
                      <select
                        id="year"
                        value={dob.year}
                        onChange={(e) => setDob(prev => ({ ...prev, year: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                      >
                        <option value="">Year</option>
                        {years.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!selectedFile || !dob.day || !dob.month || !dob.year || isUploading}
              className="w-full"
              size="lg"
            >
              {isUploading ? "Uploading..." : "Continue to Confirmation"}
            </Button>
          </form>

          {/* Disclaimer */}
          <p className="text-center text-xs text-muted-foreground">
            {DISCLAIMER}
          </p>
        </div>
      </div>
    </div>
  );
}
