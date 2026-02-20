"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";

interface AccessData {
  tier: string;
  subscription?: {
    plan: string;
    status: string;
  } | null;
  profileLimit: number;
  readingLimit: number;
}

const PLAN_LABELS: Record<string, string> = {
  trial: "Free Trial",
  basic: "Basic",
  pro: "Pro",
  ultimate: "Ultimate",
  expired: "Expired",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  past_due: "Past Due",
  canceled: "Canceled",
  expired: "Expired",
};

export default function BillingPage() {
  const [accessData, setAccessData] = useState<AccessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    fetch("/api/user/access")
      .then((r) => r.json())
      .then(setAccessData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription?")) return;
    setCanceling(true);
    try {
      const res = await fetch("/api/billing/cancel", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        alert("Subscription canceled. You will retain access until the end of your billing period.");
        window.location.reload();
      } else {
        alert(data.error || "Failed to cancel subscription.");
      }
    } catch {
      alert("Failed to cancel subscription. Please try again.");
    } finally {
      setCanceling(false);
    }
  };

  const tier = accessData?.tier ?? "trial";
  const sub = accessData?.subscription;
  const isActive = sub?.status === "active";
  const planName = PLAN_LABELS[tier] ?? tier;
  const statusLabel = sub ? (STATUS_LABELS[sub.status] ?? sub.status) : null;
  const readingLimit = accessData?.readingLimit === Infinity ? "Unlimited" : accessData?.readingLimit ?? 1;
  const profileLimit = accessData?.profileLimit === Infinity ? "Unlimited" : accessData?.profileLimit ?? 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold">Billing</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your subscription and payment methods.
        </p>
      </div>

      {/* Current plan */}
      <Card className="border-border/40">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Current Plan</CardTitle>
            <div className="flex items-center gap-2">
              {statusLabel && (
                <Badge variant={isActive ? "default" : "secondary"}>
                  {statusLabel}
                </Badge>
              )}
              <Badge variant={isActive ? "default" : "secondary"}>
                {planName}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Plan</p>
              <p className="text-sm font-medium">{planName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Readings / month</p>
              <p className="text-sm font-medium">{readingLimit}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Profiles</p>
              <p className="text-sm font-medium">{profileLimit}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {!isActive && (
              <Link href="/pricing">
                <Button className="gap-2">
                  <CreditCard className="h-4 w-4" />
                  {tier === "expired" ? "Resubscribe" : "Upgrade Plan"}
                </Button>
              </Link>
            )}
            {isActive && (
              <>
                <a
                  href="https://app.lemonsqueezy.com/my-orders"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Manage Subscription
                  </Button>
                </a>
                <Button
                  variant="destructive"
                  className="gap-2"
                  onClick={handleCancelSubscription}
                  disabled={canceling}
                >
                  {canceling ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  Cancel Subscription
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment history placeholder */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {isActive
              ? "View your full payment history and invoices in the Lemon Squeezy customer portal."
              : "No payments yet. Payment history will appear here once you subscribe to a plan."}
          </p>
          {isActive && (
            <a
              href="https://app.lemonsqueezy.com/my-orders"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block"
            >
              <Button variant="outline" size="sm" className="gap-2">
                <ExternalLink className="h-3 w-3" />
                View in Portal
              </Button>
            </a>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
