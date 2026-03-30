---
title: "Building a Multi-Tenant SaaS with Next.js"
description: "How we architected HyrecruitAI for multi-tenancy — tenant isolation, subdomain routing, and the shared vs isolated database decision."
date: "2025-08-15"
tags: nextjs, saas, multi-tenant, architecture
coverImage: /thumbnail.jpg
featured: false
---

# Building a Multi-Tenant SaaS with Next.js

When we launched HyrecruitAI, we had three early customers. Each one expected their own branded experience, isolated data, and custom configurations. We needed multi-tenancy from day one. Here is how we built it in Next.js.

## Tenant Resolution

Every request needs to resolve to a tenant before anything else happens. We support two patterns:

- **Subdomain routing**: `acme.hyrecruit.ai` resolves to the Acme Corp tenant
- **Custom domains**: `interviews.acme.com` via CNAME pointing to our infrastructure

Tenant resolution happens in Next.js middleware, before the request reaches any page or API route:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') ?? '';
  const subdomain = extractSubdomain(hostname);

  const tenant = subdomain
    ? await resolveTenantBySubdomain(subdomain)
    : await resolveTenantByCustomDomain(hostname);

  if (!tenant) {
    return NextResponse.redirect(new URL('/not-found', request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-id', tenant.id);

  return NextResponse.next({ request: { headers: requestHeaders } });
}
```

We cache tenant lookups in Redis with a 5-minute TTL. The middleware adds the tenant ID to the request headers, and every downstream handler reads it from there. No global state, no context pollution.

## The Database Decision: Shared vs Isolated

This is the most consequential architectural choice in any multi-tenant system. We evaluated three approaches:

| Approach | Isolation | Cost | Complexity |
|----------|-----------|------|------------|
| Database per tenant | Highest | Highest | High |
| Schema per tenant | High | Medium | Medium |
| Shared tables with tenant_id | Lower | Lowest | Lowest |

We went with **shared tables with tenant_id columns** and strict row-level filtering. Here is why:

- With 200+ tenants on the roadmap, managing separate databases or schemas would be an operational nightmare
- Our data model is identical across tenants -- no tenant needs custom columns
- PostgreSQL Row Level Security (RLS) gives us database-enforced isolation without relying on application code

```sql
-- Enable RLS on the interviews table
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON interviews
  USING (company_id = current_setting('app.current_tenant_id')::uuid);
```

Every database connection sets the tenant context before executing queries:

```typescript
async function withTenant<T>(tenantId: string, fn: () => Promise<T>): Promise<T> {
  await db.execute(sql`SET LOCAL app.current_tenant_id = ${tenantId}`);
  return fn();
}
```

This means even if application code accidentally omits a `WHERE company_id = ?` clause, PostgreSQL itself blocks cross-tenant data access. Defense in depth.

## Tenant Configuration

Each tenant has a configuration object stored in the database that controls:

- **Branding**: Logo URL, primary color, company name displayed in the UI
- **Features**: Which modules are enabled (video interviews, async interviews, AI evaluation)
- **Integrations**: ATS webhook URLs, SSO provider settings, email domains

## Billing Isolation

Each tenant maps to a Stripe customer. Subscriptions, invoices, and usage metering are scoped entirely to the Stripe customer ID stored in the tenant record. We never aggregate billing data across tenants — even internal analytics dashboards filter by tenant.

For usage-based billing (charged per completed interview), we track events in a `usage_events` table with `tenant_id` and `event_type` columns. A nightly job syncs these events to Stripe's usage records API. If the sync fails, it retries the next night with the accumulated delta. No interview is billed twice because each usage event has a unique ID that Stripe deduplicates.

We load tenant config at the layout level and pass it through React context:

```typescript
export default async function TenantLayout({ children }: { children: React.ReactNode }) {
  const tenantId = headers().get('x-tenant-id');
  const config = await getTenantConfig(tenantId);

  return (
    <TenantProvider config={config}>
      <ThemeWrapper primaryColor={config.primaryColor}>
        {children}
      </ThemeWrapper>
    </TenantProvider>
  );
}
```

## Data Isolation Testing

Trust but verify. We run automated tests that attempt cross-tenant data access:

1. Create two test tenants with seed data
2. Authenticate as Tenant A
3. Attempt to read, update, and delete Tenant B's records
4. Assert that every operation returns 0 results or a 403

These tests run in CI on every pull request. They have caught two bugs so far -- both in admin-level API routes where the tenant filter was applied inconsistently.

## What I Would Do Differently

If I started over, I would invest in tenant provisioning automation earlier. We manually created tenant configurations for our first 20 customers. That took approximately 45 minutes per tenant and required CTO involvement (me). That clearly did not scale.

Now we have a self-service onboarding flow that runs a 5-step provisioning pipeline:

1. Create tenant row in the database with a unique slug
2. Seed default configuration (feature flags, branding defaults, default interview templates)
3. Create subdomain DNS record via Cloudflare API (`${slug}.hyrecruit.ai`)
4. Provision a Stripe customer with the selected plan
5. Send welcome email with admin login credentials

Each step is idempotent. If step 3 fails (Cloudflare API timeout), retrying the pipeline skips steps 1-2 (already completed) and picks up from step 3. The entire pipeline runs as a background job and completes in under 30 seconds. From 45 minutes of manual work to 30 seconds of automation — that is the kind of investment that pays back immediately once you have more than 10 customers.

Multi-tenancy is one of those things that is much harder to retrofit than to build in from the start. If you are building a SaaS with Next.js, think about tenant isolation before you write your first API route. Your future self will thank you.

For how we optimize the database queries that power our multi-tenant dashboards, see [PostgreSQL Performance Patterns We Use at HyrecruitAI](/blog/postgres-performance-patterns).
