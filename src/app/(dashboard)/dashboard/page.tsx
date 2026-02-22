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
  Crown,
  CheckCircle2,
  Circle,
} from "lucide-react";

interface Reading {
  id: string;
  createdAt: string;
  analysisJson: any;
  profile?: { name: string };
}

interface UserData {
  palmConfirmed: boolean;
  palmPhotoUrl: string | null;
  dob: string | null;
  accessTier: string;
  subscription?: {
    plan: string;
    status: string;
  } | null;
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
      const [readingsRes, userRes] = await Promise.all([
        fetch("/api/readings"),
        fetch("/api/user/access"),
      ]);
      if (readingsRes.ok) {
        const readingsData = await readingsRes.json();
        setReadings(readingsData.readings || []);
      }
      if (userRes.ok) {
        setUserData(await userRes.json());
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanBadge = () => {
    const tier = userData?.accessTier;
    if (tier === "trial") return <Badge variant="secondary">Trial</Badge>;
    if (userData?.subscription?.status === "active") {
      const names: Record<string, string> = { basic: "Basic", pro: "Pro", ultimate: "Ultimate" };
      return (
        <Badge variant="default" className="bg-green-500">
          {names[userData.subscription.plan] ?? userData.subscription.plan}
        </Badge>
      );
    }
    return <Badge variant="destructive">No Active Plan</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const tier = userData?.accessTier;
  const hasNoAccess = !tier || tier === "expired";
  const palmConfirmed = userData?.palmConfirmed;

  // Steps for users who haven't completed setup
  const setupSteps = [
    {
      label: "Sign up",
      done: true,
    },
    {
      label: "Confirm your palm",
      done: !!palmConfirmed,
      href: "/palm/upload",
      cta: "Setup Palm",
    },
    {
      label: "Purchase a plan",
      done: !hasNoAccess,
      href: "/pricing",
      cta: "View Plans",
    },
  ];
  const allSetupDone = setupSteps.every((s) => s.done);

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

      {/* Setup checklist for users who haven't completed onboarding */}
      {!allSetupDone && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Crown className="h-5 w-5 text-primary" />
              Complete your setup to get your first reading
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {setupSteps.map((step) => (
                <li key={step.label} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {step.done ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground/40 shrink-0" />
                    )}
                    <span
                      className={`text-sm ${step.done ? "line-through text-muted-foreground" : "font-medium"}`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {!step.done && step.href && (
                    <Link href={step.href}>
                      <Button size="sm" variant="outline" className="shrink-0">
                        {step.cta}
                      </Button>
                    </Link>
                  )}
                </li>
              ))}
            </ol>
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
              {hasNoAccess
                ? "Purchase a plan to start your first reading."
                : "Upload a palm photo to get your AI analysis."}
            </p>
            <Link href={hasNoAccess ? "/pricing" : "/dashboard/readings/new"} className="mt-4 inline-block">
              <Button size="sm" className="gap-1">
                {hasNoAccess ? "View Plans" : "Start Reading"}
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
            <CardTitle className="text-sm font-medium">Daily Horoscope</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {tier === "pro" || tier === "ultimate"
                ? "View your daily cosmic insights."
                : "Available on Pro and Ultimate plans."}
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
                        <p className="font-medium">
                          Palm Reading{reading.profile ? ` — ${reading.profile.name}` : ""}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(reading.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Completed</Badge>
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
              {!hasNoAccess && palmConfirmed && (
                <Link href="/dashboard/readings/new" className="mt-4 inline-block">
                  <Button size="sm">Create First Reading</Button>
                </Link>
              )}
              {hasNoAccess && (
                <Link href="/pricing" className="mt-4 inline-block">
                  <Button size="sm" className="gap-2">
                    <Crown className="h-4 w-4" />
                    Get Your First Reading
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
