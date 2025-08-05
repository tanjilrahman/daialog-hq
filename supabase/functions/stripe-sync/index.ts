/**
 * Stripe webhook handler using the Supabase Stripe Sync Engine.
 *
 * This Edge Function listens for incoming Stripe webhook events.  It leverages
 * the `@supabase/stripe-sync-engine` package to convert webhook payloads into
 * structured inserts/updates in your Postgres database.  Before deploying
 * this function, run the Stripe sync engine migrations (see README) and
 * configure the following secrets via the Supabase CLI:
 *
 *   - `DATABASE_URL`: Postgres connection string
 *   - `STRIPE_SECRET_KEY`: Your Stripe secret API key
 *   - `STRIPE_WEBHOOK_SECRET`: The webhook signing secret from your Stripe dashboard
 *
 * See the Supabase blog post for details【559818773684909†L165-L267】.
 */

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { StripeSync } from 'npm:@supabase/stripe-sync-engine@0.39.0';

// Load secrets from the environment
const databaseUrl = Deno.env.get('DATABASE_URL')!;
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

// Initialise the sync engine
const stripeSync = new StripeSync({
  databaseUrl,
  stripeSecretKey,
  stripeWebhookSecret,
  backfillRelatedEntities: false,
  autoExpandLists: true,
});

// The handler reads the raw request body and signature header, then passes
// them to the sync engine.  A 202 response tells Stripe we’ve accepted the
// event for processing.
export default async function handler(req: Request): Promise<Response> {
  const signature = req.headers.get('stripe-signature');
  const rawBody = new Uint8Array(await req.arrayBuffer());
  try {
    await stripeSync.processWebhook(rawBody, signature);
  } catch (err) {
    console.error('Stripe webhook error:', err);
    return new Response(String(err), { status: 400 });
  }
  return new Response(null, { status: 202 });
}