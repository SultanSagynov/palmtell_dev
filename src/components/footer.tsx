import Link from "next/link";
import { Hand } from "lucide-react";
import { DISCLAIMER } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Hand className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">Palmtell</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              AI-powered palm reading for personality, career, and life
              insights.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Product</h4>
            <nav className="flex flex-col gap-2">
              <Link
                href="/free-reading"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Free Reading
              </Link>
              <Link
                href="/pricing"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Pricing
              </Link>
            </nav>
          </div>

          {/* Learn */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Learn</h4>
            <nav className="flex flex-col gap-2">
              <Link
                href="/blog"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Blog
              </Link>
              <Link
                href="/learn/palmistry"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                What is Palmistry?
              </Link>
              <Link
                href="/learn/palm-lines"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Palm Lines Guide
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Legal</h4>
            <nav className="flex flex-col gap-2">
              <Link
                href="/terms"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Terms of Service
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Privacy Policy
              </Link>
              <Link
                href="/refund"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Refund Policy
              </Link>
            </nav>
          </div>
        </div>

        <div className="mt-8 border-t border-border/40 pt-8">
          <p className="text-center text-xs text-muted-foreground">
            {DISCLAIMER}
          </p>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Palmtell. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
