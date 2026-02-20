"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLANS } from "@/lib/constants";

type BillingInterval = "monthly" | "annual";

const tiers = [
  {
    key: "pro" as const,
    name: PLANS.pro.name,
    description: "Most popular choice with full features.",
    monthlyPrice: PLANS.pro.price,
    annualPrice: PLANS.pro.annualPrice || PLANS.pro.price * 12,
    features: [
      { text: "5 readings per month", included: true },
      { text: "Personality, Life Path, Career", included: true },
      { text: "Relationships & Health sections", included: true },
      { text: "Lucky Numbers", included: true },
      { text: "Daily horoscope", included: true },
      { text: "Monthly horoscope", included: false },
      { text: "PDF export", included: false },
    ],
    cta: "Choose Pro",
    highlighted: true,
  },
  {
    key: "ultimate" as const,
    name: PLANS.ultimate.name,
    description: "Complete experience with unlimited readings.",
    monthlyPrice: PLANS.ultimate.price,
    annualPrice: PLANS.ultimate.annualPrice || PLANS.ultimate.price * 12,
    features: [
      { text: "Unlimited readings per month", included: true },
      { text: "All Pro features", included: true },
      { text: "Monthly horoscope forecast", included: true },
      { text: "PDF export of readings", included: true },
      { text: "Priority support", included: true },
      { text: "Early access to new features", included: true },
    ],
    cta: "Go Ultimate",
    highlighted: false,
  },
];

export default function PricingPage() {
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { isSignedIn } = useUser();
  const router = useRouter();

  const handlePlanSelect = async (plan: "pro" | "ultimate") => {
    if (!isSignedIn) {
      router.push(`/sign-up?redirect_url=/pricing`);
      return;
    }

    setLoadingPlan(plan);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          interval: interval === "monthly" ? "month" : "year",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requiresCancellation) {
          alert(
            `You already have an active ${data.currentPlan} plan. Please cancel it from billing settings before switching plans.`
          );
          router.push("/dashboard/billing");
          return;
        }
        // User not found in DB — send them to upload flow first
        if (response.status === 404) {
          router.push("/palm/upload");
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

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-serif text-4xl font-bold sm:text-5xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            One palm, one destiny. Choose your plan and lock in your reading forever.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="mt-10 flex items-center justify-center gap-3">
          <button
            onClick={() => setInterval("monthly")}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              interval === "monthly"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setInterval("annual")}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              interval === "annual"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Annual
            <Badge variant="secondary" className="ml-2">
              Save 20%
            </Badge>
          </button>
        </div>

        {/* Cards */}
        <div className="mt-12 grid gap-6 lg:grid-cols-2 max-w-3xl mx-auto">
          {tiers.map((tier) => {
            const price =
              interval === "monthly" ? tier.monthlyPrice : tier.annualPrice;
            const period = interval === "monthly" ? "/mo" : "/yr";
            const isLoading = loadingPlan === tier.key;

            return (
              <Card
                key={tier.key}
                className={cn(
                  "relative flex flex-col",
                  tier.highlighted &&
                    "border-primary shadow-lg shadow-primary/10"
                )}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge>Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="font-serif text-2xl">
                    {tier.name}
                  </CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="mb-6">
                    <span className="text-4xl font-bold">${price}</span>
                    <span className="text-muted-foreground">{period}</span>
                  </div>
                  <ul className="space-y-3">
                    {tier.features.map((feature) => (
                      <li
                        key={feature.text}
                        className="flex items-start gap-2 text-sm"
                      >
                        {feature.included ? (
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        ) : (
                          <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />
                        )}
                        <span
                          className={cn(
                            !feature.included && "text-muted-foreground/60"
                          )}
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={tier.highlighted ? "default" : "outline"}
                    onClick={() => handlePlanSelect(tier.key)}
                    disabled={isLoading || loadingPlan !== null}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      tier.cta
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          {!isSignedIn && (
            <>
              Already have an account?{" "}
              <Link href="/sign-in" className="underline hover:text-foreground">
                Sign in
              </Link>{" "}
              to manage your subscription.
            </>
          )}
        </p>
      </div>
    </section>
  );
}
