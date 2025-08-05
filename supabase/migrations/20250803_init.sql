--
-- Database initialization for Daialog HQ
-- This migration creates base tables for the CRM, accounting, payroll and task modules.
-- You can run it using the Supabase CLI: `supabase db push`.

-- Enable pgcrypto for UUID generation
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Users and Roles
-- -----------------------------------------------------------------------------

-- Table to map Supabase Auth users to application roles.
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','sales','developer')),
  created_at timestamp with time zone default now()
);

-- -----------------------------------------------------------------------------
-- CRM
-- -----------------------------------------------------------------------------

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text default 'new', -- e.g. new, contacted, qualified, won, lost
  notes text,
  archived boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  notes text,
  last_contacted date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- -----------------------------------------------------------------------------
-- Accounting
-- -----------------------------------------------------------------------------

-- Enum for transaction type
do $$ begin
  create type public.transaction_type as enum ('income','expense');
exception when duplicate_object then null; end $$;

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  description text not null,
  merchant_name text,
  amount numeric not null,
  type public.transaction_type not null,
  category text,
  tags text[],
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Rules for automatic tagging/categorisation
create table if not exists public.tagging_rules (
  id serial primary key,
  keyword text,
  merchant text,
  min_amount numeric,
  max_amount numeric,
  category text,
  tags text[]
);

-- -----------------------------------------------------------------------------
-- Payroll
-- -----------------------------------------------------------------------------

create table if not exists public.payroll (
  id uuid primary key default gen_random_uuid(),
  employee_id text not null,
  employee_name text,
  period_start date,
  period_end date,
  gross_pay numeric,
  net_pay numeric,
  created_at timestamp with time zone default now()
);

-- -----------------------------------------------------------------------------
-- Tasks (Kanban)
-- -----------------------------------------------------------------------------

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'todo', -- todo, in_progress, done
  assignee uuid references auth.users(id) on delete set null,
  due_date date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Indexes to speed up common queries
create index if not exists transactions_date_idx on public.transactions(date);
create index if not exists tasks_status_idx on public.tasks(status);

-- -----------------------------------------------------------------------------
-- Views for summaries (optional)
-- -----------------------------------------------------------------------------

-- View summarising monthly cash flow
create or replace view public.monthly_cash_flow as
select date_trunc('month', date) as month,
       sum(case when type = 'income' then amount else 0 end) as total_inflow,
       sum(case when type = 'expense' then amount else 0 end) as total_outflow
from public.transactions
group by month
order by month;

-- View summarising profit and loss
create or replace view public.profit_loss_summary as
select (select coalesce(sum(amount),0) from public.transactions where type = 'income') as total_revenue,
       (select coalesce(sum(amount),0) from public.transactions where type = 'expense') as total_expenses,
       ((select coalesce(sum(amount),0) from public.transactions where type = 'income') - (select coalesce(sum(amount),0) from public.transactions where type = 'expense')) as net_profit;

-- The end