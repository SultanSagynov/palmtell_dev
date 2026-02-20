"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
import { Hand, AlertTriangle, Check, Loader2 } from "lucide-react";
import Link from "next/link";

export default function PalmConfirmPage() {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<{
    photoUrl?: string;
    dob?: string;
  } | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    // Check if we have session data (in real implementation, this would come from cookies/session)
    // For now, we'll simulate having session data
    const mockSessionData = {
      photoUrl: "/api/temp-palm-preview", // This would be the actual temp image URL
      dob: "March 15, 1990" // This would be formatted from the session
    };
    setSessionData(mockSessionData);
  }, []);

  const handleConfirm = async () => {
    if (!isConfirmed) {
      setError("Please confirm that this is your palm and birth date");
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const response = await fetch('/api/palm/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to preview page
        router.push('/palm/preview');
      } else {
        setError(data.error || 'Palm validation failed');
      }
    } catch (err) {
      setError('Failed to validate palm. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  if (!sessionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="flex items-start gap-3 pt-6">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-destructive">Session expired</p>
                  <p className="text-sm text-destructive/80 mt-1 mb-4">
                    Your upload session has expired. Please start over.
                  </p>
                  <Link href="/palm/upload">
                    <Button size="sm">Start Over</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

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
              <h1 className="font-serif text-3xl font-bold">Confirm Your Details</h1>
              <p className="text-muted-foreground mt-2">
                Step 3 of 3 - Please review and confirm your information
              </p>
            </div>
          </div>

          {/* Confirmation Card */}
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle>Review Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Palm Photo Preview */}
              <div className="space-y-3">
                <h3 className="font-medium">Palm Photo</h3>
                <div className="relative w-full max-w-sm mx-auto">
                  <div className="aspect-[4/5] bg-muted rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <Hand className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Palm photo uploaded</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Birth Date */}
              <div className="space-y-3">
                <h3 className="font-medium">Date of Birth</h3>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-center font-medium">{sessionData.dob}</p>
                </div>
              </div>

              {/* Important Notice */}
              <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <h4 className="font-medium text-amber-900 dark:text-amber-100">
                      Important Notice
                    </h4>
                    <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                      <li>• This will be YOUR palm reading</li>
                      <li>• You cannot change these details later</li>
                      <li>• All future readings will use this data</li>
                      <li>• Your palm and birth date will be locked forever</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Confirmation Checkbox */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="confirm"
                    checked={isConfirmed}
                    onChange={(e) => setIsConfirmed(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="confirm"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I confirm this is my palm and birth date
                    </label>
                    <p className="text-xs text-muted-foreground">
                      By checking this box, you agree that this information is accurate and belongs to you.
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                  disabled={isValidating}
                >
                  Go Back
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={!isConfirmed || isValidating}
                  className="flex-1"
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Confirm & Continue
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Progress Indicator */}
          <div className="flex justify-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Check className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="w-8 h-1 bg-primary"></div>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Check className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="w-8 h-1 bg-primary"></div>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                3
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
