import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import TransactionUpload from "@/components/Accounting/TransactionUpload";
import RulesEditor from "@/components/Accounting/RulesEditor";
import CashFlowChart from "@/components/Accounting/CashFlowChart";
import { supabase } from "@/lib/supabaseClient";
import { Transaction } from "@/lib/types";

export default function AccountingPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      let query = supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false });
      if (filter) {
        query = query.eq("category", filter);
      }
      const { data, error } = await query;
      if (!error && data) setTransactions(data as Transaction[]);
      setLoading(false);
    };
    fetchTransactions();
  }, [filter]);

  const categories = Array.from(
    new Set(transactions.map((t) => t.category).filter(Boolean))
  ) as string[];

  return (
    <ProtectedRoute allowedRoles={["admin", "developer"]}>
      <h1 className="mb-4 text-xl font-bold text-lightBlue">Accounting</h1>
      <div className="grid gap-4 mb-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <TransactionUpload />
          <RulesEditor />
        </div>
        <div>
          <CashFlowChart />
        </div>
      </div>
      <div className="flex flex-wrap gap-2 items-center mb-4">
        <label htmlFor="category" className="mr-2">
          Filter by Category:
        </label>
        <select
          id="category"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-2 py-1 rounded text-darkBlue"
        >
          <option value="">All</option>
          {categories.map((c) => (
            <option key={c} value={c!}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="px-2 py-1 border-b border-lightBlue">Date</th>
              <th className="px-2 py-1 border-b border-lightBlue">
                Description
              </th>
              <th className="px-2 py-1 border-b border-lightBlue">Amount</th>
              <th className="px-2 py-1 border-b border-lightBlue">Type</th>
              <th className="px-2 py-1 border-b border-lightBlue">Category</th>
              <th className="px-2 py-1 border-b border-lightBlue">Tags</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-400">
                  Loading…
                </td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr key={t.id} className="hover:bg-darkBlue/50">
                  <td className="px-2 py-1 border-b border-lightBlue">
                    {t.date}
                  </td>
                  <td className="px-2 py-1 border-b border-lightBlue">
                    {t.description}
                  </td>
                  <td className="px-2 py-1 border-b border-lightBlue">
                    {t.amount.toFixed(2)}
                  </td>
                  <td className="px-2 py-1 capitalize border-b border-lightBlue">
                    {t.type}
                  </td>
                  <td className="px-2 py-1 border-b border-lightBlue">
                    {t.category || ""}
                  </td>
                  <td className="px-2 py-1 border-b border-lightBlue">
                    {(t.tags || []).join(", ")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </ProtectedRoute>
  );
}
