/**
 * Gusto payroll synchronisation function.
 *
 * This Edge Function demonstrates how to perform a basic OAuth 2.0 code
 * exchange with the Gusto API and how to fetch payroll data for your
 * organisation.  Note that Gusto currently limits API access to approved
 * developers and requires a production pre‑approval and security review
 *【364250209589338†L99-L149】.
 *
 * Environment variables (set via `supabase secrets set --env-file supabase/.env`):
 *   - GUSTO_CLIENT_ID
 *   - GUSTO_CLIENT_SECRET
 *   - GUSTO_REDIRECT_URI (should point to this function’s URL)
 *   - GUSTO_TOKEN (optional long‑lived refresh token)
 *   - SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 */

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.43.0';

// Read secrets
const gustoClientId = Deno.env.get('GUSTO_CLIENT_ID')!;
const gustoClientSecret = Deno.env.get('GUSTO_CLIENT_SECRET')!;
const gustoRedirectUri = Deno.env.get('GUSTO_REDIRECT_URI')!;
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});

/**
 * Exchange an authorization code for an access token.
 */
async function exchangeCode(code: string) {
  const url = 'https://auth.gusto.com/oauth/token';
  const body = new URLSearchParams({
    client_id: gustoClientId,
    client_secret: gustoClientSecret,
    grant_type: 'authorization_code',
    code,
    redirect_uri: gustoRedirectUri,
  });
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!res.ok) throw new Error(`Gusto token exchange failed: ${res.status}`);
  return (await res.json()) as { access_token: string; refresh_token: string; expires_in: number };
}

/**
 * Fetch payroll summaries from the Gusto API.  Adjust the endpoint/path as
 * required for your integration.  Here we fetch payrolls for the current
 * company (assumes only one company per account).
 */
async function fetchPayrollData(accessToken: string) {
  const res = await fetch('https://api.gusto-demo.com/v1/companies', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Unable to fetch companies: ${res.status}`);
  const companies = await res.json();
  const company = companies[0];
  if (!company) return [];
  const payrollsRes = await fetch(`https://api.gusto-demo.com/v1/companies/${company.id}/payrolls`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!payrollsRes.ok) throw new Error(`Unable to fetch payrolls: ${payrollsRes.status}`);
  return (await payrollsRes.json()) as any[];
}

/**
 * Persist payroll data into the `payroll` table.  You might customise this
 * according to your schema.  This example upserts records based on payroll ID.
 */
async function savePayrollRecords(records: any[]) {
  const formatted = records.map((p) => ({
    id: p.id,
    employee_id: p.pay_period.pay_period_id ?? '',
    employee_name: p.payroll_run_name ?? '',
    period_start: p.pay_period?.start_date ?? null,
    period_end: p.pay_period?.end_date ?? null,
    gross_pay: p.totals?.current?.gross_pay ?? null,
    net_pay: p.totals?.current?.net_pay ?? null,
  }));
  await supabase.from('payroll').upsert(formatted, { onConflict: ['id'] });
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  // OAuth callback: handle `?code=` parameter
  const code = url.searchParams.get('code');
  if (code) {
    try {
      const { access_token } = await exchangeCode(code);
      const payrolls = await fetchPayrollData(access_token);
      await savePayrollRecords(payrolls);
      return new Response('Payroll data synced', { status: 200 });
    } catch (err) {
      console.error(err);
      return new Response('Error syncing payroll: ' + (err as Error).message, { status: 500 });
    }
  }
  // If no code is present, direct the user to Gusto’s OAuth authorization URL
  const gustoAuthUrl = new URL('https://app.gusto-demo.com/oauth/authorize');
  gustoAuthUrl.searchParams.set('client_id', gustoClientId);
  gustoAuthUrl.searchParams.set('redirect_uri', gustoRedirectUri);
  gustoAuthUrl.searchParams.set('response_type', 'code');
  gustoAuthUrl.searchParams.set('scope', 'openid offline_access payroll');
  return new Response(
    JSON.stringify({ authorize_url: gustoAuthUrl.toString() }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
}