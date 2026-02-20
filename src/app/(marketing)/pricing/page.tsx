"use client";

import { useState } from "react";
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
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLANS } from "@/lib/constants";

type BillingInterval = "monthly" | "annual";

const tiers = [
  {
    key: "basic" as const,
    name: PLANS.basic.name,
    description: "Perfect for getting started with palm reading.",
    monthlyPrice: PLANS.basic.price,
    annualPrice: PLANS.basic.price * 12,
    features: [
      { text: "1 reading per month", included: true },
      { text: "Personality, Life Path, Career", included: true },
      { text: "Your palm locked forever", included: true },
      { text: "Relationships & Health", included: false },
      { text: "Lucky Numbers", included: false },
      { text: "Daily horoscope", included: false },
      { text: "Monthly horoscope", included: false },
      { text: "PDF export", included: false },
    ],
    cta: "Start with Basic",
    href: "/palm/upload",
    highlighted: false,
  },
  {
    key: "pro" as const,
    name: PLANS.pro.name,
    description: "Most popular choice with full features.",
    monthlyPrice: PLANS.pro.price,
    annualPrice: PLANS.pro.annualPrice || PLANS.pro.price * 12,
    features: [
      { text: "5 readings per month", included: true },
      { text: "All Basic features", included: true },
      { text: "Relationships & Health sections", included: true },
      { text: "Lucky Numbers", included: true },
      { text: "Daily horoscope", included: true },
      { text: "Monthly horoscope", included: false },
      { text: "PDF export", included: false },
    ],
    cta: "Choose Pro",
    href: "/palm/upload",
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
    href: "/palm/upload",
    highlighted: false,
  },
];

export default function PricingPage() {
  const [interval, setInterval] = useState<BillingInterval>("monthly");

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
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => {
            const price =
              interval === "monthly" ? tier.monthlyPrice : tier.annualPrice;
            const period = interval === "monthly" ? "/mo" : "/yr";

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
                    <span className="text-4xl font-bold">
                      {price === 0 ? "Free" : `$${price}`}
                    </span>
                    {price > 0 && (
                      <span className="text-muted-foreground">{period}</span>
                    )}
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
                  <Link href={tier.href} className="w-full">
                    <Button
                      className="w-full"
                      variant={tier.highlighted ? "default" : "outline"}
                    >
                      {tier.cta}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
