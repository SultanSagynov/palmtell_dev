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
  Plus, 
  Clock,
  Calendar,
  User
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Profile {
  id: string;
  name: string;
  avatarEmoji?: string;
  isDefault: boolean;
  _count: {
    readings: number;
  };
}

interface Reading {
  id: string;
  createdAt: string;
  status: string;
  profile: {
    name: string;
    avatarEmoji?: string;
  };
}

interface UserData {
  trialStartedAt?: string;
  trialExpiresAt?: string;
  subscription?: {
    plan: string;
    status: string;
  };
}

export default function DashboardPage() {
  const { user } = useUser();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [readings, setReadings] = useState<Reading[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (selectedProfileId) {
      loadReadings(selectedProfileId);
    }
  }, [selectedProfileId]);

  const loadDashboardData = async () => {
    try {
      // Load profiles
      const profilesRes = await fetch("/api/profiles");
      if (profilesRes.ok) {
        const profilesData = await profilesRes.json();
        setProfiles(profilesData.profiles || []);
        
        // Select default profile
        const defaultProfile = profilesData.profiles?.find((p: Profile) => p.isDefault);
        if (defaultProfile) {
          setSelectedProfileId(defaultProfile.id);
        }
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

  const loadReadings = async (profileId: string) => {
    try {
      const response = await fetch(`/api/readings?profile_id=${profileId}`);
      if (response.ok) {
        const data = await response.json();
        setReadings(data.readings || []);
      }
    } catch (error) {
      console.error("Failed to load readings:", error);
    }
  };

  const getTrialInfo = () => {
    if (!userData?.trialStartedAt || !userData?.trialExpiresAt) {
      return null;
    }

    const expiresAt = new Date(userData.trialExpiresAt);
    const now = new Date();
    const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      daysRemaining: Math.max(0, daysRemaining),
      isExpired: daysRemaining <= 0
    };
  };

  const getPlanBadge = () => {
    const trialInfo = getTrialInfo();
    
    if (userData?.subscription?.status === "active") {
      return (
        <Badge variant="default" className="bg-green-500">
          {userData.subscription.plan === "pro" ? "Pro" : "Ultimate"}
        </Badge>
      );
    }
    
    if (trialInfo?.isExpired) {
      return <Badge variant="destructive">Trial Expired</Badge>;
    }
    
    if (trialInfo) {
      return <Badge variant="secondary">Trial ({trialInfo.daysRemaining}d left)</Badge>;
    }
    
    return <Badge variant="outline">Free</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const selectedProfile = profiles.find(p => p.id === selectedProfileId);
  const trialInfo = getTrialInfo();

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

      {/* Trial countdown banner */}
      {trialInfo && !trialInfo.isExpired && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-900 dark:text-amber-100">
                  {trialInfo.daysRemaining} days of full access remaining
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Upgrade to keep unlimited access to all reading sections
                </p>
              </div>
            </div>
            <Link href="/pricing">
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                Upgrade Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Profile switcher */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Active Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {profiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => setSelectedProfileId(profile.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                  selectedProfileId === profile.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <span className="text-lg">
                  {profile.avatarEmoji || "👤"}
                </span>
                <span className="font-medium">{profile.name}</span>
                {profile.isDefault && (
                  <Badge variant="secondary" className="text-xs">Default</Badge>
                )}
              </button>
            ))}
            <Link href="/dashboard/profiles/new">
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border hover:border-primary/50 transition-colors">
                <Plus className="h-4 w-4" />
                <span>Add Profile</span>
              </button>
            </Link>
          </div>
        </CardContent>
      </Card>

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

      {/* Reading history for selected profile */}
      {selectedProfile && (
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Recent Readings - {selectedProfile.name}
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
                        <Badge variant={reading.status === 'completed' ? 'default' : 'secondary'}>
                          {reading.status}
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
                <p className="text-muted-foreground">No readings yet for {selectedProfile.name}</p>
                <Link href="/dashboard/readings/new" className="mt-4 inline-block">
                  <Button size="sm">
                    Create First Reading
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
