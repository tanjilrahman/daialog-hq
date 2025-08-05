/**
 * Shared type definitions for Daialog HQ front‑end.
 */

export type UserRole = 'admin' | 'sales' | 'developer';

export interface Company {
  id: string;
  name: string;
  status: string;
  notes?: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  company_id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  last_contacted?: string | null;
  created_at: string;
  updated_at: string;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  merchant_name?: string | null;
  amount: number;
  type: TransactionType;
  category?: string | null;
  tags?: string[] | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaggingRule {
  id: number;
  keyword?: string | null;
  merchant?: string | null;
  min_amount?: number | null;
  max_amount?: number | null;
  category?: string | null;
  tags?: string[] | null;
}

export interface PayrollRecord {
  id: string;
  employee_id: string;
  employee_name?: string | null;
  period_start?: string | null;
  period_end?: string | null;
  gross_pay?: number | null;
  net_pay?: number | null;
  created_at?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: 'todo' | 'in_progress' | 'done';
  assignee?: string | null;
  due_date?: string | null;
  created_at: string;
  updated_at: string;
}