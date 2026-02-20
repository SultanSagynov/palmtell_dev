import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Hand,
  Sparkles,
  Brain,
  Heart,
  Briefcase,
  Shield,
  Star,
  ArrowRight,
  Upload,
  Cpu,
  Eye,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PalmSight — AI Palm Reading | Discover Your Destiny",
  description:
    "Upload a photo of your palm and get instant AI-powered insights about your personality, career path, relationships, and more. Starting at $0.99/month.",
};

const features = [
  {
    icon: Brain,
    title: "Personality",
    description:
      "Discover your core traits, strengths, and hidden talents through AI analysis of your palm lines.",
  },
  {
    icon: Sparkles,
    title: "Life Path",
    description:
      "Understand your life, head, and heart lines and what they reveal about your journey.",
  },
  {
    icon: Briefcase,
    title: "Career Guidance",
    description:
      "Get personalized career recommendations based on your palm's unique characteristics.",
  },
  {
    icon: Heart,
    title: "Relationships",
    description:
      "Learn what your palm says about your approach to love, friendship, and connection.",
  },
  {
    icon: Shield,
    title: "Health Insights",
    description:
      "Explore wellness patterns and vitality indicators found in your palm structure.",
  },
  {
    icon: Star,
    title: "Lucky Numbers",
    description:
      "Receive your personal lucky numbers and symbols derived from your palm reading.",
  },
];

const steps = [
  {
    icon: Upload,
    title: "Upload Palm & Birth Date",
    description:
      "Take a clear photo of your palm and enter your birth date. Your data is locked forever to your account.",
  },
  {
    icon: Eye,
    title: "Confirm & Validate",
    description:
      "Review your information and confirm. Our AI validates your palm photo for quality.",
  },
  {
    icon: Cpu,
    title: "Choose Plan & Read",
    description:
      "Subscribe to unlock your full reading. Basic starts at just $0.99/month.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4">
              AI-Powered Palm Reading
            </Badge>
            <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Discover What Your{" "}
              <span className="text-primary">Palm</span> Reveals
            </h1>
            <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
              Upload a photo of your palm and let AI uncover your personality,
              life path, career strengths, and more. Your palm reading is locked
              to your account forever.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/palm/upload">
                <Button size="lg" className="gap-2 text-base">
                  <Hand className="h-5 w-5" />
                  Read My Palm Now
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg" className="gap-2 text-base">
                  View Plans
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Starting at $0.99/month. One palm, one destiny.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-bold sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-muted-foreground">
              Three simple steps to unlock your palm reading.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.title} className="relative text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <step.icon className="h-7 w-7" />
                </div>
                <span className="mt-4 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Step {i + 1}
                </span>
                <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border/40 bg-card/50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-bold sm:text-4xl">
              What Your Reading Includes
            </h2>
            <p className="mt-4 text-muted-foreground">
              A comprehensive AI analysis of your palm covering six key areas.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="border-border/40 bg-background/50"
              >
                <CardContent className="pt-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-bold sm:text-4xl">
              Ready to Discover Your Palm&apos;s Secrets?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Your palm and destiny, locked to your account forever. Starting at just $0.99/month.
            </p>
            <Link href="/palm/upload" className="mt-8 inline-block">
              <Button size="lg" className="gap-2 text-base">
                <Hand className="h-5 w-5" />
                Read My Palm Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
