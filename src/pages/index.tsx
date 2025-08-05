import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from '@/pages/_app';

interface Counts {
  companies: number;
  contacts: number;
  transactions: number;
  tasks: number;
}

export default function Dashboard() {
  const { role } = useUser();
  const [counts, setCounts] = useState<Counts>({ companies: 0, contacts: 0, transactions: 0, tasks: 0 });

  useEffect(() => {
    const loadCounts = async () => {
      // fetch counts for each table.  If the user lacks access, the count will be 0.
      const tables = ['companies', 'contacts', 'transactions', 'tasks'] as const;
      const newCounts: Partial<Counts> = {};
      for (const table of tables) {
        const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
        newCounts[table] = count ?? 0;
      }
      setCounts(newCounts as Counts);
    };
    loadCounts();
  }, []);

  return (
    <ProtectedRoute>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="Companies" count={counts.companies} />
        <SummaryCard title="Contacts" count={counts.contacts} />
        {(role === 'admin' || role === 'developer') && <SummaryCard title="Transactions" count={counts.transactions} />}
        <SummaryCard title="Tasks" count={counts.tasks} />
      </div>
    </ProtectedRoute>
  );
}

function SummaryCard({ title, count }: { title: string; count: number }) {
  return (
    <div className="bg-darkBlue border border-lightBlue rounded p-4 shadow text-center">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <p className="text-3xl text-lightBlue font-bold">{count}</p>
    </div>
  );
}