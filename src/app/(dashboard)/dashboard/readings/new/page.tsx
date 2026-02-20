"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { DISCLAIMER } from "@/lib/constants";
import Link from "next/link";
import { AlertCircle, Hand } from "lucide-react";

interface UserData {
  palmConfirmed: boolean;
  palmPhotoUrl: string | null;
  subscription?: {
    plan: string;
    status: string;
  };
}

export default function NewReadingPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch("/api/user/access");
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      fetchUserData();
    }
  }, [user]);

  const createReading = async () => {
    if (!userData?.palmConfirmed) return;
    
    setIsCreating(true);
    try {
      const response = await fetch("/api/readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        router.push(`/dashboard/readings/${data.reading.id}`);
      } else {
        console.error("Failed to create reading:", data.error);
      }
    } catch (error) {
      console.error("Failed to create reading:", error);
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

  // Show message if palm not confirmed
  if (!userData?.palmConfirmed) {
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
                You need to complete palm setup before you can create readings.
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

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold">New Palm Reading</h1>
        <p className="mt-1 text-muted-foreground">
          Upload a clear photo of your palm to begin the AI analysis.
        </p>
      </div>

      {/* Create Reading Button */}
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
            </p>
            <Button 
              onClick={createReading} 
              disabled={isCreating}
              className="w-full"
            >
              {isCreating ? "Creating Reading..." : "Create Reading"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
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
