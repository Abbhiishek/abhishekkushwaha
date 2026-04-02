---
title: "Implementing Subscription Billing with Razorpay in a Multi-Tenant SaaS"
description: "How we integrated Razorpay subscriptions at HyrecruitAI — webhook reliability, tenant-scoped billing, failed payment recovery, and the edge cases that almost cost us revenue."
date: "2026-04-02"
tags: razorpay, payments, saas, billing, typescript
coverImage: /thumbnail.jpg
featured: false
---

# Implementing Subscription Billing with Razorpay in a Multi-Tenant SaaS

Our first paying customer signed up on a Friday afternoon. By Monday morning, their subscription had silently failed to renew, they had lost access to the platform mid-interview, and I was writing an apology email explaining why our "enterprise-grade" product could not handle a basic recurring payment.

The failure was not Razorpay's fault. It was ours. We had treated billing as a checkout flow — collect the payment and move on. Subscription billing is fundamentally different: it is a continuous process with retries, state transitions, dunning logic, and edge cases that only surface after your first hundred customers. Here is what we learned rebuilding it correctly.

## The Problem

HyrecruitAI runs three subscription tiers:

| Plan | Price | Included | Overage |
|------|-------|----------|---------|
| Hobby | Free | 5 interviews/month | None |
| Starter | Rs 2,999/month | 50 interviews/month | Rs 99/interview |
| Pro | Rs 9,999/month | Unlimited interviews | N/A |

The initial implementation was straightforward: create a Razorpay subscription when the user selects a plan, store the subscription ID, and check `subscription.status === 'active'` before allowing access. It worked for the first 10 customers. Then reality kicked in.

**Problem 1: Webhook delivery is not guaranteed.** Razorpay sends webhook events for subscription state changes (created, authenticated, activated, charged, paused, cancelled). Our server was only listening for `subscription.charged` and `subscription.cancelled`. We missed `subscription.halted` (payment failed after all retry attempts), so customers with failed cards stayed on "active" in our database while Razorpay had already stopped their subscription.

**Problem 2: No idempotency.** Razorpay retries webhook delivery if your server does not respond with a 2xx status within 5 seconds. Our handler processed the same `subscription.charged` event multiple times, creating duplicate invoice records and sending duplicate confirmation emails.

**Problem 3: No tenant isolation in billing.** Our billing queries were not scoped by tenant. An admin dashboard query to "show all active subscriptions" returned subscriptions across all tenants. Not a security breach (the data was not customer-facing), but a sign that our billing layer did not follow the same isolation patterns as the rest of the platform.

## The Solution

We rebuilt the billing layer over two weeks. The core design principle: **Razorpay is the source of truth for payment state. Our database mirrors that state through webhooks, and every operation is idempotent.**

### Subscription Lifecycle Management

We modeled the full Razorpay subscription lifecycle as a state machine:

```typescript
type SubscriptionStatus =
  | 'created'      // Plan selected, payment not yet authorized
  | 'authenticated' // Payment method verified
  | 'active'       // Subscription is live and paid
  | 'pending'      // Payment attempt in progress
  | 'halted'       // All payment retries exhausted
  | 'paused'       // Manually paused by admin
  | 'cancelled'    // Subscription ended
  | 'expired';     // Past the end date

interface TenantSubscription {
  id: string;
  tenantId: string;
  razorpaySubscriptionId: string;
  razorpayCustomerId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelledAt: Date | null;
  metadata: Record<string, unknown>;
}
```

The key design decision: we store `status` as a mirror of Razorpay's state, but we never update it directly from application code. Status changes only come through webhooks. If a customer clicks "Cancel Subscription" in our UI, we call Razorpay's cancel API, which triggers a webhook, which updates our database. This ensures our state never diverges from Razorpay's.

### Webhook Handler with Idempotency

The webhook handler is the most critical piece of code in our billing system:

```typescript
export async function handleRazorpayWebhook(req: Request): Promise<Response> {
  const signature = req.headers.get('x-razorpay-signature');
  const body = await req.text();

  // Step 1: Verify signature
  const isValid = Razorpay.validateWebhookSignature(
    body,
    signature,
    process.env.RAZORPAY_WEBHOOK_SECRET
  );
  if (!isValid) {
    return new Response('Invalid signature', { status: 401 });
  }

  const event = JSON.parse(body);

  // Step 2: Idempotency check — have we processed this event already?
  const existingEvent = await db
    .select()
    .from(schema.webhookEvents)
    .where(eq(schema.webhookEvents.eventId, event.event_id))
    .limit(1);

  if (existingEvent.length > 0) {
    // Already processed — return 200 so Razorpay stops retrying
    return new Response('Already processed', { status: 200 });
  }

  // Step 3: Record the event before processing
  await db.insert(schema.webhookEvents).values({
    eventId: event.event_id,
    eventType: event.event,
    payload: event,
    processedAt: new Date(),
  });

  // Step 4: Route to handler
  switch (event.event) {
    case 'subscription.authenticated':
      await handleSubscriptionAuthenticated(event.payload);
      break;
    case 'subscription.activated':
    case 'subscription.charged':
      await handleSubscriptionCharged(event.payload);
      break;
    case 'subscription.halted':
      await handleSubscriptionHalted(event.payload);
      break;
    case 'subscription.cancelled':
      await handleSubscriptionCancelled(event.payload);
      break;
    case 'payment.failed':
      await handlePaymentFailed(event.payload);
      break;
  }

  return new Response('OK', { status: 200 });
}
```

The idempotency guarantee is simple: we store every event ID in a `webhook_events` table before processing. If the same event arrives again (Razorpay retry), we return 200 immediately without re-processing. The `event_id` column has a unique index, so even concurrent duplicate deliveries are safe.

### Tenant-Scoped Billing

Every billing query is scoped by `tenantId`. The subscription table has a `tenant_id` column, and we enforce it at the query level:

```typescript
async function getActiveSubscription(tenantId: string) {
  return db
    .select()
    .from(schema.subscriptions)
    .where(
      and(
        eq(schema.subscriptions.tenantId, tenantId),
        eq(schema.subscriptions.status, 'active')
      )
    )
    .limit(1);
}
```

For usage-based billing (overage charges on the Starter plan), we track interview completions per billing cycle per tenant:

```typescript
async function getUsageForCurrentCycle(tenantId: string) {
  const subscription = await getActiveSubscription(tenantId);
  if (!subscription) return { used: 0, limit: 0 };

  const count = await db
    .select({ total: count(schema.interviews.id) })
    .from(schema.interviews)
    .where(
      and(
        eq(schema.interviews.tenantId, tenantId),
        eq(schema.interviews.status, 'completed'),
        gte(schema.interviews.completedAt, subscription.currentPeriodStart),
        lte(schema.interviews.completedAt, subscription.currentPeriodEnd)
      )
    );

  return {
    used: count[0]?.total ?? 0,
    limit: getPlanLimit(subscription.planId),
  };
}
```

## The Iteration

### Attempt 1: Polling Razorpay API (Abandoned)

Before implementing webhooks properly, we tried polling the Razorpay API every 5 minutes to check subscription statuses. This was unreliable (rate limits, missed transitions between polls), expensive (API calls for every active subscription), and slow (a payment failure could go undetected for up to 5 minutes).

### Attempt 2: Webhooks Without Idempotency (Broken)

Our first webhook implementation processed every event it received. During a Razorpay incident where they retried a batch of events, we processed 47 `subscription.charged` events twice. This created duplicate invoices and sent 47 duplicate "payment successful" emails. Three customers emailed us asking if they had been double-charged. They had not (Razorpay only charged once), but the duplicate emails destroyed trust.

### Attempt 3: Current Architecture (Stable)

The idempotent webhook handler with event deduplication has processed over 15,000 webhook events with zero duplicates and zero missed state transitions. The `webhook_events` table also serves as an audit log — we can replay any event to debug billing issues.

## Architecture / Flow Diagram

### Diagram: Subscription Billing Flow

```
- Box: "Customer UI" connects via arrow "Select Plan" to Box: "Next.js API"
- Box: "Next.js API" connects via arrow "Create Subscription" to Box: "Razorpay API"
- Box: "Razorpay API" connects via arrow "Payment Page URL" back to Box: "Next.js API"
- Box: "Next.js API" connects via arrow "Redirect" to Box: "Razorpay Checkout"
- Box: "Razorpay Checkout" connects via arrow "Payment Completed" to Box: "Razorpay API"
- Box: "Razorpay API" connects via arrow "Webhook Event" to Box: "Webhook Handler"
- Box: "Webhook Handler" contains: "1. Verify Signature → 2. Idempotency Check → 3. Store Event → 4. Update Subscription Status"
- Box: "Webhook Handler" connects via arrow "Update Status" to Box: "PostgreSQL (subscriptions table)"
- Box: "PostgreSQL" connects via arrow "Query" to Box: "Access Control Middleware"
- Box: "Access Control Middleware" connects via arrow "Allow/Deny" to Box: "Protected Routes"
- Dashed box around "Webhook Handler" and "PostgreSQL" labeled "Tenant-Scoped"
```

### Diagram: Failed Payment Recovery Flow

```
- Box: "Razorpay" connects via arrow "payment.failed webhook" to Box: "Webhook Handler"
- Box: "Webhook Handler" connects via arrow "Record failure" to Box: "Payment Failures Table"
- Box: "Webhook Handler" connects via arrow "Send notification" to Box: "Email Service"
- Box: "Email Service" sends "Update payment method" email to Box: "Customer"
- Box: "Razorpay" connects via arrow "Auto-retry (3 attempts)" to itself (loop)
- Box: "Razorpay" connects via arrow "subscription.halted webhook (after all retries fail)" to Box: "Webhook Handler"
- Box: "Webhook Handler" connects via arrow "Set status = halted" to Box: "PostgreSQL"
- Box: "Webhook Handler" connects via arrow "Trigger grace period (7 days)" to Box: "Grace Period Timer"
- Box: "Grace Period Timer" connects via arrow "If no payment after 7 days" to Box: "Downgrade to Hobby"
```

## Learnings and Outcomes

**Webhook reliability improved from ~85% to 100%.** Before the idempotency fix, we had a 15% rate of "eventually consistent" subscription states — our database would catch up within minutes, but during that window, customers might see incorrect plan information. Now, every state transition is processed exactly once, typically within 2 seconds of Razorpay sending the event.

**Failed payment recovery rate: 60%.** After implementing the dunning flow (email notification on first failure, reminder on second failure, final warning before downgrade), 60% of halted subscriptions recover within 7 days. Before, we had zero recovery — halted subscriptions stayed halted until the customer noticed and contacted support.

**Revenue leakage eliminated.** We discovered that 3 customers on the Starter plan had been exceeding their interview quota without being charged overage fees. The usage tracking query was not filtering by `currentPeriodStart`, so it was counting interviews from previous billing cycles. Total leaked revenue: approximately Rs 12,000 over 2 months.

**Admin visibility.** The billing admin dashboard now shows real-time subscription metrics: active count by plan, MRR (monthly recurring revenue), churn rate, and failed payment rate. All queries are tenant-scoped, and the admin can filter by plan tier to see exactly who is on each plan.

## Suggestions for Engineers Implementing This

**Start with webhooks, not polling.** Razorpay's webhook system is reliable once you handle idempotency correctly. Polling is always a worse experience — higher latency, higher API costs, and missed edge cases.

**Store raw webhook payloads.** The `webhook_events` table with full JSON payloads has saved us dozens of debugging hours. When a customer reports a billing issue, we can trace the exact sequence of events from Razorpay's perspective.

**Never update billing state from application code.** This is the most important lesson. If your "Cancel" button directly sets `status = cancelled` in the database, you will inevitably have divergence between your state and Razorpay's. Always go through the API → webhook → database path.

**Test with Razorpay's test mode extensively.** Razorpay's test mode simulates all event types including payment failures, subscription halting, and dunning. We have a test suite that creates a subscription, triggers a payment failure, verifies the webhook processing, and checks that the grace period logic works — all against Razorpay's test API.

**Build the admin dashboard early.** Having visibility into subscription counts by plan, failed payments, and churn rate is not a "nice to have." It is how you catch revenue leakage and failed payment patterns before they compound. We should have built it month one, not month six.
