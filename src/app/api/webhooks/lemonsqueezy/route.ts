import { headers } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { getPlanFromVariantId } from "@/lib/lemonsqueezy";
import { sendEmail, createSubscriptionCanceledEmail } from "@/lib/email";

export async function POST(req: Request) {
  const body = await req.text();
  const headerPayload = await headers();
  const signature = headerPayload.get("x-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing x-signature header" },
      { status: 400 }
    );
  }

  // Verify webhook signature
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET!;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(body);
  const digest = hmac.digest('hex');

  if (signature !== digest) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body);
  const eventName = event.meta?.event_name;
  const userId = event.meta?.custom_data?.user_id;

  if (!userId) {
    console.log("No user_id in webhook data");
    return NextResponse.json({ received: true });
  }

  try {
    switch (eventName) {
      case "subscription_created": {
        const subscription = event.data;
        const plan = getPlanFromVariantId(subscription.attributes.variant_id);
        
        if (!plan) {
          console.error("Unknown variant_id:", subscription.attributes.variant_id);
          break;
        }

        await db.subscription.upsert({
          where: { userId },
          create: {
            userId,
            lsSubscriptionId: subscription.id,
            lsCustomerId: subscription.attributes.customer_id.toString(),
            plan,
            status: subscription.attributes.status,
            renewsAt: subscription.attributes.renews_at 
              ? new Date(subscription.attributes.renews_at) 
              : null,
          },
          update: {
            lsSubscriptionId: subscription.id,
            lsCustomerId: subscription.attributes.customer_id.toString(),
            plan,
            status: subscription.attributes.status,
            renewsAt: subscription.attributes.renews_at 
              ? new Date(subscription.attributes.renews_at) 
              : null,
          },
        });
        break;
      }

      case "subscription_updated": {
        const subscription = event.data;
        const plan = getPlanFromVariantId(subscription.attributes.variant_id);
        
        if (!plan) {
          console.error("Unknown variant_id:", subscription.attributes.variant_id);
          break;
        }

        await db.subscription.update({
          where: { userId },
          data: {
            plan,
            status: subscription.attributes.status,
            renewsAt: subscription.attributes.renews_at 
              ? new Date(subscription.attributes.renews_at) 
              : null,
          },
        });
        break;
      }

      case "subscription_cancelled": {
        const subscription = event.data;
        
        await db.subscription.update({
          where: { userId },
          data: { 
            status: 'canceled',
            endsAt: subscription.attributes.ends_at 
              ? new Date(subscription.attributes.ends_at)
              : null,
          },
        });

        // Send cancellation email
        try {
          const user = await db.user.findUnique({ where: { id: userId } });
          if (user) {
            const endDate = subscription.attributes.ends_at 
              ? new Date(subscription.attributes.ends_at).toLocaleDateString()
              : 'end of current period';
            const cancelEmail = createSubscriptionCanceledEmail(
              user.email, 
              user.name || "there", 
              endDate
            );
            await sendEmail(cancelEmail);
          }
        } catch (error) {
          console.error("Failed to send cancellation email:", error);
        }
        break;
      }

      case "subscription_expired": {
        await db.subscription.update({
          where: { userId },
          data: { status: 'expired' },
        });
        break;
      }

      case "subscription_payment_success": {
        const subscription = event.data;
        
        await db.subscription.update({
          where: { userId },
          data: { 
            status: 'active',
            renewsAt: subscription.attributes.renews_at 
              ? new Date(subscription.attributes.renews_at) 
              : null,
          },
        });
        break;
      }

      case "subscription_payment_failed": {
        await db.subscription.update({
          where: { userId },
          data: { status: 'past_due' },
        });
        break;
      }

      // One-time purchase for the Basic plan
      case "order_created": {
        const order = event.data;
        // Only process paid orders
        if (order.attributes.status !== 'paid') break;

        const variantId = order.attributes.first_order_item?.variant_id;
        const plan = variantId ? getPlanFromVariantId(variantId) : null;

        if (plan !== 'basic') {
          console.log("order_created for non-basic variant, skipping:", variantId);
          break;
        }

        // Grant permanent basic access (no subscription renewal — one-time purchase)
        await db.subscription.upsert({
          where: { userId },
          create: {
            userId,
            lsCustomerId: order.attributes.customer_id?.toString(),
            plan: 'basic',
            status: 'active',
          },
          update: {
            lsCustomerId: order.attributes.customer_id?.toString(),
            plan: 'basic',
            status: 'active',
          },
        });
        break;
      }

      default:
        console.log("Unhandled webhook event:", eventName);
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
