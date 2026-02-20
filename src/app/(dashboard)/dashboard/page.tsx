"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Hand, 
  BookOpen, 
  Star, 
  ArrowRight, 
  Clock,
  Calendar,
  User
} from "lucide-react";

interface Reading {
  id: string;
  createdAt: string;
  analysisJson: any;
}

interface UserData {
  palmConfirmed: boolean;
  palmPhotoUrl: string | null;
  dob: string | null;
  subscription?: {
    plan: string;
    status: string;
  };
}

export default function DashboardPage() {
  const { user } = useUser();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load user readings (no profile filtering needed)
      const readingsRes = await fetch("/api/readings");
      if (readingsRes.ok) {
        const readingsData = await readingsRes.json();
        setReadings(readingsData.readings || []);
      }

      // Load user data
      const userRes = await fetch("/api/user/access");
      if (userRes.ok) {
        const accessData = await userRes.json();
        setUserData(accessData);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanBadge = () => {
    if (userData?.subscription?.status === "active") {
      const planName = userData.subscription.plan === "basic" ? "Basic" : 
                      userData.subscription.plan === "pro" ? "Pro" : "Ultimate";
      return (
        <Badge variant="default" className="bg-green-500">
          {planName}
        </Badge>
      );
    }
    
    return <Badge variant="destructive">No Active Plan</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Welcome back, {user?.firstName || "there"}. Here&apos;s your palm reading overview.
          </p>
        </div>
        {getPlanBadge()}
      </div>

      {/* Palm status card */}
      {userData && (
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hand className="h-5 w-5" />
              Your Palm Reading Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                <Hand className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  {userData.palmConfirmed ? "Palm Confirmed" : "Palm Setup Required"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {userData.palmConfirmed 
                    ? "Your palm is locked and ready for readings"
                    : "Complete palm setup to start getting readings"
                  }
                </p>
                {userData.dob && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Birth date: {new Date(userData.dob).toLocaleDateString()}
                  </p>
                )}
              </div>
              {!userData.palmConfirmed && (
                <Link href="/palm/upload">
                  <Button size="sm">
                    Setup Palm
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Reading</CardTitle>
            <Hand className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Upload a palm photo to get your AI analysis.
            </p>
            <Link href="/dashboard/readings/new" className="mt-4 inline-block">
              <Button size="sm" className="gap-1">
                Start Reading
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Readings</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{readings.length}</div>
            <p className="text-xs text-muted-foreground">readings completed</p>
            <Link href="/dashboard/readings" className="mt-4 inline-block">
              <Button variant="outline" size="sm" className="gap-1">
                View History
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Daily Horoscope
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Set your date of birth to unlock daily horoscopes.
            </p>
            <Link href="/dashboard/horoscope" className="mt-4 inline-block">
              <Button variant="outline" size="sm" className="gap-1">
                View Horoscope
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Reading history */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Recent Readings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {readings.length > 0 ? (
            <div className="space-y-3">
              {readings.slice(0, 3).map((reading) => (
                <Link key={reading.id} href={`/dashboard/readings/${reading.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Hand className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Palm Reading</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(reading.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">
                        Completed
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              ))}
              {readings.length > 3 && (
                <Link href="/dashboard/readings">
                  <Button variant="outline" size="sm" className="w-full">
                    View All {readings.length} Readings
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Hand className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No readings yet</p>
              <Link href="/dashboard/readings/new" className="mt-4 inline-block">
                <Button size="sm">
                  Create First Reading
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
