# Daialog HQ

Daialog HQ is an internal operations dashboard built with **Next.js** (React) and **Tailwind CSS** on the front‑end and **Supabase** on the back‑end.  It consolidates sales/CRM, accounting, payroll and task management into a single secure interface.  The project is designed for modularity and easy customization by your development team.

## Features

- **User Authentication & RBAC** – Utilises Supabase Auth for email/password login with custom roles (Admin, Sales, Developer).  Admins have full access; sales reps are limited to the CRM; developers have backend/admin access.
- **CRM module** – Manage companies and contacts.  Add, edit, archive and comment on leads.  Filter and search by status or tags.
- **Accounting dashboard** – Import CSV transactions, tag/categorise them manually or via automatic rules, view cash flow charts and a simple P&L summary.  Includes sample Supabase Edge Function for syncing Stripe data into Postgres using the official `@supabase/stripe-sync-engine` package【559818773684909†L165-L267】.
- **Payroll module** – Integrates with the Gusto API (OAuth 2 flow) to display team members, payroll history and gross/net pay.  A sample Edge Function illustrates how to call Gusto’s endpoints.
- **Task management** – A lightweight Kanban board with columns for “To Do”, “In Progress” and “Done”.  Tasks can be assigned to users with due dates and notes.
- **Responsive design** – Uses Tailwind CSS and follows the Daialog brand colours: dark blue `#0A1F3D`, light blue `#55A7F5` and white `#FFFFFF`.  The layout is mobile‑friendly and modern.

This repository contains both the front‑end (in `src/`) and back‑end (Supabase database schema and Edge Functions in `supabase/`).  The code is ready for deployment to **Vercel** and **Supabase**.

## Prerequisites

1. **Supabase account** – Create a new project via [supabase.com](https://supabase.com).  Supabase provides a Postgres database, authentication and serverless functions.  See the Supabase documentation for setting up a project and enabling Role Based Access Control (RBAC).  Supabase’s RBAC feature lets you define roles with specific permissions and assign those roles to users【745271952421763†L35-L69】.
2. **Stripe account** – Required if you wish to enable the accounting module’s real‑time payment syncing.  Stripe webhooks will be forwarded to Supabase Edge Functions.
3. **Gusto developer account** – To access payroll data you need to register in the [Gusto Developer Portal](https://dev.gusto.com) and request production pre‑approval.  Gusto’s API currently only supports approved developers; general customers cannot connect directly【364250209589338†L99-L102】.  During onboarding you’ll obtain `client_id` and `client_secret` credentials and configure redirect URIs【364250209589338†L114-L144】.
4. **Node.js ≥ 18 & npm** – The front‑end uses Next.js 15 (React 19).  You’ll install dependencies locally via `npm install` when setting up your environment.
5. **Supabase CLI** – Install `supabase` from `https://supabase.com/docs/guides/cli`.  It lets you run migrations, manage environment variables and deploy functions.

## Local Setup

1. **Clone the repository**

   ```bash
   git clone <your-fork> && cd daialog-hq
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Copy environment variables**

   Create a `.env.local` in the project root with the following variables (see `supabase/.env.example` for back‑end secrets).  The `NEXT_PUBLIC_…` variables are required at build time by Next.js.

   ```bash
   # Front‑end
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   # Optional: Analytics, etc.
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`.  Sign up or log in with Supabase Auth to access the dashboard.

5. **Set up the Supabase project**

   1. Initialise your Supabase project by logging in via the CLI:

      ```bash
      supabase login
      supabase link --project-ref <project-ref>
      ```

   2. **Run database migrations.**  The SQL file `supabase/migrations/20250803_init.sql` creates the necessary tables (`companies`, `contacts`, `transactions`, `tagging_rules`, `tasks`) and types.  Apply it locally via:

      ```bash
      supabase db reset
      supabase db push
      ```

   3. **Enable Row Level Security (RLS).**  By default, Supabase denies all reads/writes when RLS is on.  This project assumes that you create policies granting access based on the user’s role claim in the JWT.  Use the `user_roles` table (created by the migration) to map `auth.uid()` to a role and then write policies such as:

      ```sql
      -- Example: only admins and developers can select all companies
      create policy "Allow admins and devs to read companies"
        on public.companies for select
        using (
          exists (
            select 1 from public.user_roles ur
            where ur.user_id = auth.uid()
              and ur.role in ('admin','developer')
          )
        );
      ```

   4. **Load environment variables** for Edge Functions:

      ```bash
      cd supabase
      cp .env.example .env
      # fill in secrets for Stripe, Gusto and your Postgres connection
      supabase secrets set --env-file .env
      ```

   5. **Deploy the Edge Functions**:

      ```bash
      supabase functions deploy stripe-sync
      supabase functions deploy gusto-sync
      ```

      The CLI will output the URLs for your functions.  Use those URLs to configure webhooks in Stripe and to set your Gusto redirect URI.

6. **Connect Stripe**

   - Create a webhook in your Stripe dashboard pointing to the `stripe-sync` function URL.  Configure events such as `invoice.payment_failed` and `customer.subscription.updated`.  The `@supabase/stripe-sync-engine` library listens to these events and writes structured records into your `stripe` schema【559818773684909†L165-L267】.
   - Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in `supabase/.env`.  Load them via `supabase secrets set --env-file .env`.

7. **Connect Gusto**

   - Register an application on the [Gusto Developer Portal](https://dev.gusto.com) and request production pre‑approval.  Gusto’s documentation notes that direct API access for customers is not yet available【364250209589338†L99-L102】, so integration requires an approved developer account.
   - Once approved, configure your redirect URI to the `gusto-sync` function URL and store `GUSTO_CLIENT_ID`, `GUSTO_CLIENT_SECRET` and related tokens in `supabase/.env`.
   - The example `gusto-sync` function demonstrates how to fetch payroll records using your access token and persist them to the `payroll` table.

8. **Invite users and assign roles**

   - Use the Supabase dashboard to invite new users via email.  After they sign up, insert a record into the `public.user_roles` table assigning them `admin`, `sales` or `developer` roles.  The front‑end reads the `role` claim from the JWT and restricts routes accordingly.

## Deployment

### Front‑end (Vercel)

1. Push your repository to GitHub.
2. Sign into [Vercel](https://vercel.com) and import the project.
3. Add the following environment variables in the Vercel dashboard under *Project Settings → Environment Variables*:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Set the build command to `npm run build` and the output directory to `.next` (default for Next.js 15).  Vercel will automatically deploy on each push.

### Backend (Supabase)

The Supabase database, authentication and functions are hosted automatically when you create your project.  Migrations are applied via the CLI; functions can be updated with `supabase functions deploy`.  Remember to set RLS policies and environment variables.

## Repository Contents

| Path | Purpose |
| --- | --- |
| **`src/`** | Next.js pages and components (front‑end) |
| **`supabase/migrations/`** | SQL migrations defining tables, views and RLS helpers |
| **`supabase/functions/`** | Supabase Edge Functions for Stripe and Gusto integrations |
| **`supabase/.env.example`** | Example environment variables for the back‑end |
| **`package.json`** | Dependencies and scripts |
| **`tailwind.config.js`** | Custom Tailwind configuration (brand colours) |

## Additional Notes

* **Edge Functions** – Supabase Edge Functions are globally distributed and written in TypeScript running on Deno【751429765972498†L174-L184】.  They are ideal for webhooks and third‑party integrations like Stripe and Gusto because they are low latency and support environment variables.
* **Stripe Sync** – The included `stripe-sync` function uses the `@supabase/stripe-sync-engine` library, which converts Stripe webhooks into Postgres inserts and updates.  Follow the steps in the module to run migrations and set secrets【559818773684909†L165-L267】.
* **Gusto Integration** – Because Gusto restricts API access to approved developers, ensure you complete their production pre‑approval process.  Once you have a `client_id` and `secret`, you can exchange an OAuth code for a token inside the `gusto-sync` function and then call endpoints to fetch employees and payrolls【364250209589338†L114-L149】.

Feel free to extend and customise this dashboard to suit your internal workflows.  If you encounter issues or need further enhancements (e.g., additional modules or advanced analytics), your development team can build on the provided foundations.#   d a i a l o g - h q  
 