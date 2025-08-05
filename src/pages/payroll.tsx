import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { supabase } from '@/lib/supabaseClient';
import { PayrollRecord } from '@/lib/types';

export default function PayrollPage() {
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('payroll').select('*').order('period_start', { ascending: false });
      if (!error && data) setRecords(data as PayrollRecord[]);
      setLoading(false);
    };
    fetchRecords();
  }, []);

  return (
    <ProtectedRoute allowedRoles={['admin', 'developer']}>
      <h1 className="text-xl font-bold mb-4 text-lightBlue">Payroll</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="px-2 py-1 border-b border-lightBlue">Employee</th>
              <th className="px-2 py-1 border-b border-lightBlue">Period</th>
              <th className="px-2 py-1 border-b border-lightBlue">Gross Pay</th>
              <th className="px-2 py-1 border-b border-lightBlue">Net Pay</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-4 text-center text-gray-400">Loading…</td></tr>
            ) : (
              records.map((r) => (
                <tr key={r.id} className="hover:bg-darkBlue/50">
                  <td className="px-2 py-1 border-b border-lightBlue">{r.employee_name ?? r.employee_id}</td>
                  <td className="px-2 py-1 border-b border-lightBlue">
                    {r.period_start} – {r.period_end}
                  </td>
                  <td className="px-2 py-1 border-b border-lightBlue">{r.gross_pay?.toFixed(2)}</td>
                  <td className="px-2 py-1 border-b border-lightBlue">{r.net_pay?.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </ProtectedRoute>
  );
}