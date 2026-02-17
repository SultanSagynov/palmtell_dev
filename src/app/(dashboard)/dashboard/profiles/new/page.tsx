"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";

interface UserData {
  accessTier: string;
  profileLimit: number;
}

const EMOJI_OPTIONS = ["👤", "👨", "👩", "🧑", "👶", "👴", "👵", "🌟", "💫", "🌙", "☀️", "🌸", "🌺", "🌹", "🦋"];

export default function NewProfilePage() {
  const { user } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [emoji, setEmoji] = useState("👤");

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      const response = await fetch("/api/user/access");
      if (!response.ok) {
        throw new Error("Failed to load user data");
      }
      const data = await response.json();
      setUserData({
        accessTier: data.tier || data.accessTier || "trial",
        profileLimit: data.profileLimit || 1,
      });
    } catch (error) {
      console.error("Failed to load user data:", error);
      setError("Failed to load profile information");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Profile name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          dob: dob || null,
          avatarEmoji: emoji,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create profile");
      }

      // Redirect to the new profile's reading page
      router.push(`/dashboard/reading/new?profileId=${data.profile.id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  const canCreateProfile = userData && userData.profileLimit > 0;

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/dashboard/profiles" className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-8">
        <ArrowLeft className="h-4 w-4" />
        Back to Profiles
      </Link>

      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold mb-2">Create New Profile</h1>
        <p className="text-muted-foreground">
          Create a profile for yourself or a loved one to start getting personalized readings.
        </p>
      </div>

      {!canCreateProfile && userData && (
        <Card className="mb-6 border-destructive/50 bg-destructive/5">
          <CardContent className="py-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
            <div>
              <p className="font-medium text-destructive">Profile limit reached</p>
              <p className="text-sm text-destructive/80">Upgrade your plan to create more profiles.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/40">
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <Label htmlFor="name" className="text-base">
                Profile Name *
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                Enter your name or the name of the person you're creating this profile for.
              </p>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., John Doe"
                className="text-base"
                disabled={isSubmitting}
              />
            </div>

            {/* Date of Birth */}
            <div>
              <Label htmlFor="dob" className="text-base">
                Date of Birth <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                Add your date of birth to unlock horoscope and lucky number predictions.
              </p>
              <Input
                id="dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="text-base"
                disabled={isSubmitting}
              />
            </div>

            {/* Avatar Emoji */}
            <div>
              <Label className="text-base">
                Avatar Emoji <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <p className="text-sm text-muted-foreground mb-3">
                Choose an emoji to represent this profile.
              </p>
              <div className="flex flex-wrap gap-2">
                {EMOJI_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setEmoji(option)}
                    className={`p-3 rounded-lg border-2 text-2xl transition-all ${
                      emoji === option
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-border/60"
                    }`}
                    disabled={isSubmitting}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => router.back()}
                variant="outline"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !canCreateProfile}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Profile"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Info card */}
      <Card className="mt-6 border-border/40 bg-muted/20">
        <CardContent className="py-6">
          <h3 className="font-semibold mb-2">What happens next?</h3>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li><strong>1.</strong> Create your profile with basic information</li>
            <li><strong>2.</strong> Upload a clear photo of your palm</li>
            <li><strong>3.</strong> Get an AI-powered palm reading with insights about your personality, career, and future</li>
            <li><strong>4.</strong> Save your readings and track changes over time</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
