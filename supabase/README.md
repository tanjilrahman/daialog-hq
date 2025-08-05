# Supabase Backend

This directory contains migrations, Edge Functions and environment examples for the Daialog HQ back‑end.  Supabase provides a hosted Postgres database, authentication and serverless functions (called **Edge Functions**) that run on Deno.  These functions are globally distributed and are ideal for handling webhooks and integrating third‑party services like Stripe and Gusto【751429765972498†L174-L184】.

## Migrations

- **`migrations/20250803_init.sql`** – Creates tables for user roles, CRM, accounting, payroll and tasks.  It also defines a few summary views.
  - *Important*: After running this migration, enable Row Level Security and define policies appropriate for your application.  Supabase denies all reads/writes when RLS is enabled unless policies explicitly allow them.

To apply migrations locally, run:

```bash
supabase db reset
supabase db push
```

## Edge Functions

- **`stripe-sync/index.ts`** – Handles Stripe webhooks using the `@supabase/stripe-sync-engine`.  Deploy this function and configure a Stripe webhook pointing to it.  The sync engine requires the environment variables `DATABASE_URL`, `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`【559818773684909†L165-L267】.
- **`gusto-sync/index.ts`** – Demonstrates how to exchange an OAuth code for an access token, fetch payroll data from the Gusto API and persist it to the `payroll` table.  Because Gusto restricts API access, you must obtain developer credentials and production approval【364250209589338†L99-L149】.  Configure `GUSTO_CLIENT_ID`, `GUSTO_CLIENT_SECRET`, `GUSTO_REDIRECT_URI` and optionally `GUSTO_TOKEN` in your secrets.

Deploy functions with:

```bash
supabase functions deploy stripe-sync
supabase functions deploy gusto-sync
```

## Environment Variables

`supabase/.env.example` lists all of the secrets expected by the functions.  Copy it to `.env` and fill in your real values, then load them with:

```bash
supabase secrets set --env-file supabase/.env
```

Note that the `SUPABASE_SERVICE_ROLE_KEY` is required for inserting into tables from Edge Functions.  Keep this key confidential and never expose it to clients.