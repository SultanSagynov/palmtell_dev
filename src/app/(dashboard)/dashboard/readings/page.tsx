"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Hand, Plus, ArrowRight, Crown, Lock } from "lucide-react";
import { useUser } from "@clerk/nextjs";

interface Reading {
  id: string;
  createdAt: string;
  status: string | null;
  profile: { name: string; avatarEmoji: string | null };
}

interface UserAccess {
  accessTier: string;
  readingLimit: number;
  palmConfirmed: boolean;
}

export default function ReadingsPage() {
  const { user } = useUser();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [userAccess, setUserAccess] = useState<UserAccess | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [readingsRes, accessRes] = await Promise.all([
        fetch("/api/readings"),
        fetch("/api/user/access"),
      ]);
      if (readingsRes.ok) {
        const data = await readingsRes.json();
        setReadings(data.readings || []);
      }
      if (accessRes.ok) setUserAccess(await accessRes.json());
    } catch (err) {
      console.error("Failed to load readings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border-border/40">
            <CardContent className="py-4">
              <div className="h-10 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const tier = userAccess?.accessTier;
  const hasAccess = tier && tier !== "expired";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">My Readings</h1>
          <p className="mt-1 text-muted-foreground">
            Your palm reading history and timeline.
          </p>
        </div>
        {hasAccess && userAccess?.palmConfirmed && (
          <Link href="/dashboard/readings/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Reading
            </Button>
          </Link>
        )}
      </div>

      {/* No plan — prompt to purchase */}
      {!hasAccess && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
              <Lock className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Get Your First Reading</h2>
            <p className="max-w-sm text-sm text-muted-foreground mb-6">
              Purchase a plan to unlock your palm reading. Start with a one-time $0.99
              reading or choose Pro/Ultimate for ongoing insights.
            </p>
            <Link href="/pricing">
              <Button className="gap-2">
                <Crown className="h-4 w-4" />
                View Plans
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Palm not confirmed */}
      {hasAccess && !userAccess?.palmConfirmed && (
        <Card className="border-border/40">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
              <Hand className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Complete Palm Setup</h2>
            <p className="max-w-sm text-sm text-muted-foreground mb-6">
              Upload and confirm your palm photo to start receiving AI-powered readings.
            </p>
            <Link href="/palm/upload">
              <Button className="gap-2">
                <Hand className="h-4 w-4" />
                Setup Palm
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Has access + palm confirmed but no readings yet */}
      {hasAccess && userAccess?.palmConfirmed && readings.length === 0 && (
        <Card className="border-border/40">
          <CardContent className="flex flex-col items-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Hand className="h-8 w-8" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">No Readings Yet</h2>
            <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
              Upload a photo of your palm to get your first AI-powered reading.
              Your palm lines evolve over time — each reading captures a unique
              moment in your journey.
            </p>
            <Link href="/dashboard/readings/new" className="mt-6">
              <Button className="gap-2">
                <Hand className="h-4 w-4" />
                Start Your First Reading
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Readings list */}
      {readings.length > 0 && (
        <div className="space-y-3">
          {readings.map((reading) => (
            <Link key={reading.id} href={`/dashboard/readings/${reading.id}`}>
              <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                    {reading.profile.avatarEmoji ? (
                      reading.profile.avatarEmoji
                    ) : (
                      <Hand className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">Palm Reading — {reading.profile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(reading.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      reading.status === "completed"
                        ? "default"
                        : reading.status === "failed"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {reading.status === "completed"
                      ? "Completed"
                      : reading.status === "failed"
                      ? "Failed"
                      : "Processing"}
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
