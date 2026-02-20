"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Hand, AlertTriangle, Check, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function PalmConfirmPage() {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<{
    photoUrl?: string;
    dob?: string;
    photoKey?: string;
  } | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const response = await fetch('/api/palm/session');
        if (response.ok) {
          const data = await response.json();
          if (data.photoKey && data.dob) {
            const formattedDob = format(new Date(data.dob), 'MMMM d, yyyy');
            setSessionData({
              photoUrl: data.photoUrl,
              dob: formattedDob,
              photoKey: data.photoKey
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch session data:', error);
      } finally {
        setIsSessionLoading(false);
      }
    };

    fetchSessionData();
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

  if (isSessionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Hand className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
            </div>
            <div className="space-y-3">
              <h1 className="font-bold text-4xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Confirm Your Details
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Step 3 of 3 - Please review and confirm your information
              </p>
            </div>
          </div>

          {/* Confirmation Card */}
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Review Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Palm Photo Preview */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Palm Photo</h3>
                <div className="relative w-full max-w-sm mx-auto">
                  {sessionData?.photoUrl ? (
                    <div className="aspect-[4/5] rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-lg">
                      <img 
                        src={sessionData.photoUrl} 
                        alt="Your palm photo" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden aspect-[4/5] bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                        <div className="text-center space-y-2">
                          <Hand className="h-12 w-12 mx-auto text-gray-400" />
                          <p className="text-sm text-gray-500">Palm photo uploaded</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-[4/5] bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <Hand className="h-12 w-12 mx-auto text-gray-400" />
                        <p className="text-sm text-gray-500">Palm photo uploaded</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Birth Date */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Date of Birth</h3>
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 rounded-xl border border-indigo-200 dark:border-indigo-800">
                  <p className="text-center font-semibold text-lg text-indigo-900 dark:text-indigo-100">{sessionData?.dob || 'Loading...'}</p>
                </div>
              </div>

              {/* Important Notice */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 border border-amber-200 dark:border-amber-800 rounded-xl p-5 shadow-sm">
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
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
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
