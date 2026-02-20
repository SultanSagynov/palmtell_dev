"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Hand, Star, Lock, CreditCard, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { PLANS } from "@/lib/constants";

export default function PalmPreviewPage() {
  const [previewData, setPreviewData] = useState<{
    personality?: string;
    lifePath?: string;
    career?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    // Show a preview of what the full reading contains
    setTimeout(() => {
      setPreviewData({
        personality: "You possess a natural charisma and leadership qualities that draw others to you. Your palm reveals a strong sense of independence and creativity...",
        lifePath: "Your life path indicates a journey of personal growth and achievement. You are destined for success in endeavors that allow you to express your unique talents...",
        career: "Your career line suggests opportunities in creative fields or leadership positions. You have the potential to make a significant impact in your chosen profession..."
      });
      setIsLoading(false);
    }, 2000);
  }, []);

  const handleSubscribe = async (plan: "pro" | "ultimate") => {
    setLoadingPlan(plan);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, interval: "month" }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requiresCancellation) {
          alert(
            `You already have an active ${data.currentPlan} plan. Please cancel it from billing settings before switching.`
          );
          router.push("/dashboard/billing");
          return;
        }
        throw new Error(data.error || "Failed to create checkout");
      }

      const checkoutUrl = data.checkoutUrl || data.url;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Hand className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <div>
                <h1 className="font-serif text-3xl font-bold">Analyzing Your Palm...</h1>
                <p className="text-muted-foreground mt-2">
                  Our AI is studying your palm lines and creating your personalized reading
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {["Analyzing palm lines...", "Interpreting life path...", "Generating insights..."].map((step) => (
                <div key={step} className="flex items-center gap-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
                  </div>
                  <span className="text-sm">{step}</span>
                </div>
              ))}
            </div>
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
            <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h1 className="font-serif text-3xl font-bold">Your Reading is Ready!</h1>
              <p className="text-muted-foreground mt-2">
                Here&apos;s a preview of your personalized palm reading
              </p>
            </div>
          </div>

          {/* Preview Sections */}
          <div className="space-y-6">
            {/* Personality - Always visible */}
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Personality
                  </span>
                  <Badge variant="default">Unlocked</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">
                  {previewData?.personality?.slice(0, 150)}...
                </p>
              </CardContent>
            </Card>

            {/* Life Path - Blurred */}
            <Card className="border-border/40 relative">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Hand className="h-5 w-5 text-blue-500" />
                    Life Path
                  </span>
                  <Badge variant="secondary">Locked</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="blur-sm">
                  <p className="text-sm leading-relaxed">{previewData?.lifePath}</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <Lock className="h-6 w-6 mx-auto text-muted-foreground" />
                    <p className="text-sm font-medium">Subscribe to unlock</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Career - Blurred */}
            <Card className="border-border/40 relative">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-green-500" />
                    Career
                  </span>
                  <Badge variant="secondary">Locked</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="blur-sm">
                  <p className="text-sm leading-relaxed">{previewData?.career}</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <Lock className="h-6 w-6 mx-auto text-muted-foreground" />
                    <p className="text-sm font-medium">Subscribe to unlock</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pricing Options */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-center">Unlock Your Full Reading</CardTitle>
              <p className="text-center text-sm text-muted-foreground mt-1">
                ✨ Your palm is confirmed — subscribe now for instant access
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {/* Pro Plan - Recommended */}
                <div className="border-2 border-primary rounded-lg p-4 space-y-3 relative">
                  <Badge className="absolute -top-2 left-4 bg-primary">Recommended</Badge>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{PLANS.pro.name}</h3>
                      <p className="text-sm text-muted-foreground">Most popular choice</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">${PLANS.pro.price}</div>
                      <div className="text-sm text-muted-foreground">/month</div>
                    </div>
                  </div>
                  <ul className="text-sm space-y-1">
                    {PLANS.pro.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => handleSubscribe("pro")}
                    className="w-full"
                    disabled={loadingPlan !== null}
                  >
                    {loadingPlan === "pro" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Choose Pro"
                    )}
                  </Button>
                </div>

                {/* Ultimate Plan */}
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{PLANS.ultimate.name}</h3>
                      <p className="text-sm text-muted-foreground">Complete experience</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">${PLANS.ultimate.price}</div>
                      <div className="text-sm text-muted-foreground">/month</div>
                    </div>
                  </div>
                  <ul className="text-sm space-y-1">
                    {PLANS.ultimate.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => handleSubscribe("ultimate")}
                    variant="outline"
                    className="w-full"
                    disabled={loadingPlan !== null}
                  >
                    {loadingPlan === "ultimate" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Go Ultimate"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Back Button */}
          <div className="text-center">
            <Link href="/palm/upload">
              <Button variant="ghost" size="sm">
                ← Start Over
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
