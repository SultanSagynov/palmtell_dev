"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { DISCLAIMER } from "@/lib/constants";
import Link from "next/link";
import { AlertCircle, Hand, Crown, Lock } from "lucide-react";

interface UserAccess {
  palmConfirmed: boolean;
  palmPhotoUrl: string | null;
  accessTier: string;
  readingLimit: number;
  subscription?: { plan: string; status: string } | null;
}

interface Profile {
  id: string;
  name: string;
  isDefault: boolean;
}

export default function NewReadingPage() {
  const [userAccess, setUserAccess] = useState<UserAccess | null>(null);
  const [defaultProfile, setDefaultProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [accessRes, profilesRes] = await Promise.all([
        fetch("/api/user/access"),
        fetch("/api/profiles"),
      ]);
      if (accessRes.ok) setUserAccess(await accessRes.json());
      if (profilesRes.ok) {
        const { profiles } = await profilesRes.json();
        const def = (profiles as Profile[]).find((p) => p.isDefault) ?? profiles[0] ?? null;
        setDefaultProfile(def);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const createReading = async () => {
    if (!userAccess?.palmConfirmed || !defaultProfile) return;

    setIsCreating(true);
    setError(null);
    try {
      const response = await fetch("/api/readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: defaultProfile.id }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/dashboard/readings/${data.reading.id}`);
      } else {
        setError(data.error || "Failed to create reading");
      }
    } catch (err) {
      setError("Failed to create reading. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  const tier = userAccess?.accessTier;
  const hasAccess = tier && tier !== "expired";

  // Palm not confirmed yet
  if (!userAccess?.palmConfirmed) {
    return (
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="font-serif text-3xl font-bold">New Palm Reading</h1>
          <p className="mt-1 text-muted-foreground">
            Your palm must be confirmed before creating readings.
          </p>
        </div>
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-destructive">Palm setup required</p>
              <p className="text-sm text-destructive/80 mt-1 mb-4">
                Complete palm setup before creating readings.
              </p>
              <Link href="/palm/upload">
                <Button size="sm">Setup Palm</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No active plan
  if (!hasAccess) {
    return (
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="font-serif text-3xl font-bold">New Palm Reading</h1>
          <p className="mt-1 text-muted-foreground">
            Choose a plan to unlock your palm reading.
          </p>
        </div>
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-start gap-3 pt-6">
            <Lock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Purchase a plan to get started</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Your palm is ready. Get your first reading for just $0.99 — a one-time
                payment that includes Personality, Life Path, and Career insights.
                Or upgrade to Pro/Ultimate for more readings and deeper insights.
              </p>
              <Link href="/pricing">
                <Button size="sm" className="gap-2">
                  <Crown className="h-4 w-4" />
                  View Plans
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold">New Palm Reading</h1>
        <p className="mt-1 text-muted-foreground">
          Generate a new AI-powered palm analysis using your confirmed palm photo.
        </p>
      </div>

      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hand className="h-5 w-5" />
            Generate New Reading
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Create a new palm reading using your confirmed palm photo and birth date.
              {defaultProfile && (
                <span className="block mt-1">
                  Reading will be created for profile: <strong>{defaultProfile.name}</strong>
                </span>
              )}
            </p>
            {error && (
              <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            <Button
              onClick={createReading}
              disabled={isCreating || !defaultProfile}
              className="w-full"
            >
              {isCreating ? "Creating Reading..." : "Create Reading"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="text-base">Photo Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[
              "Use good, natural lighting",
              "Open your hand fully with fingers slightly spread",
              "Hold your palm flat and facing the camera",
              "Ensure all major palm lines are clearly visible",
              "Avoid shadows across the palm",
            ].map((tip) => (
              <li
                key={tip}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {tip}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">{DISCLAIMER}</p>
    </div>
  );
}
