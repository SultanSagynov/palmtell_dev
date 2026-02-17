import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund Policy | Palmtell",
  description: "Refund Policy for Palmtell. Learn about our return and refund process for subscriptions and services.",
  robots: "index, follow",
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl font-bold mb-4">Refund Policy</h1>
          <p className="text-muted-foreground">
            Last updated: January 2024
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>1. Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                At Palmtell, we're committed to ensuring your satisfaction with our service. This refund policy outlines the terms under which we may provide refunds for subscriptions and services purchased through our platform.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Refund Eligibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>You may be eligible for a refund in the following cases:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Trial Period:</strong> If you're unsatisfied with Palmtell during your trial period, you can cancel anytime with no charges.</li>
                <li><strong>Billing Error:</strong> If you were charged incorrectly or double-charged, we will issue a refund.</li>
                <li><strong>Service Unavailability:</strong> If Palmtell is unavailable for an extended period due to technical issues, we may offer a refund or credit.</li>
                <li><strong>30-Day Money Back Guarantee:</strong> For new subscribers, if you're not satisfied within 30 days of your first paid subscription, you may request a full refund.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Non-Refundable Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>The following items are generally non-refundable:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Subscriptions after the 30-day money-back guarantee period has expired</li>
                <li>Services used or accessed beyond the refund eligibility period</li>
                <li>Promotional credits or discounts applied to your account</li>
                <li>Refunds requested more than 30 days after purchase</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. How to Request a Refund</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>To request a refund, please follow these steps:</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Log in to your Palmtell account</li>
                <li>Navigate to your billing or account settings</li>
                <li>Select your subscription and look for the refund or cancellation option</li>
                <li>If you need assistance, contact our support team at support@palmtell.app</li>
              </ol>
              <p className="mt-4 text-sm text-muted-foreground">
                Please provide any relevant details about your refund request, such as the transaction ID and reason for the refund.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Refund Processing Time</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Once your refund request is approved, the refund will be processed back to your original payment method. Please allow:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Credit/Debit Cards:</strong> 5-10 business days</li>
                <li><strong>PayPal:</strong> 5-10 business days</li>
                <li><strong>Other methods:</strong> Varies depending on your financial institution</li>
              </ul>
              <p className="mt-4 text-sm text-muted-foreground">
                Note: Your bank or credit card company may take additional time to post the refund to your account.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Subscription Cancellation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                You can cancel your subscription at any time through your account settings. Upon cancellation:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your access will continue until the end of the current billing period</li>
                <li>No charges will be applied for the next billing period</li>
                <li>You will not receive refunds for the current billing period</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Exceptions and Special Cases</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                In certain circumstances, we may make exceptions to this refund policy at our sole discretion. These may include:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>System failures that prevent you from accessing your service</li>
                <li>Unauthorized transactions</li>
                <li>Significant service degradation</li>
              </ul>
              <p className="mt-4">
                If you believe your situation qualifies for an exception, please contact us with documentation.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                If you have questions about this refund policy or need to request a refund, please contact us:
              </p>
              <div className="space-y-2 mt-4">
                <p><strong>Email:</strong> support@palmtell.app</p>
                <p><strong>Support Portal:</strong> Visit our help center through your account dashboard</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We reserve the right to update this refund policy at any time. Changes will be effective immediately upon posting to the website. Your continued use of Palmtell after any changes constitutes your acceptance of the new policy.
              </p>
            </CardContent>
          </Card>

          {/* Legal Links */}
          <div className="border-t pt-8">
            <p className="text-sm text-muted-foreground">
              Related policies:
            </p>
            <div className="flex gap-4 mt-4">
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
