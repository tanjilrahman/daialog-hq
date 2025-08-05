import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

/**
 * Component allowing the user to upload a CSV file of transactions.  The CSV
 * should include at least `date`, `description`, `amount` and `type` columns.
 */
export default function TransactionUpload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const text = await file.text();
      const lines = text.trim().split(/\r?\n/);
      if (lines.length < 2) throw new Error('Empty CSV');
      const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const records = lines.slice(1).map((line) => {
        const cols = line.split(',');
        const record: any = {};
        header.forEach((h, idx) => {
          record[h] = cols[idx];
        });
        return record;
      });
      // map to DB fields and convert numbers/dates
      const data = records.map((r) => ({
        date: r.date,
        description: r.description,
        merchant_name: r.merchant_name || null,
        amount: parseFloat(r.amount),
        type: r.type as 'income' | 'expense',
        category: r.category || null,
        tags: r.tags ? r.tags.split('|') : null,
        notes: r.notes || null,
      }));
      const { error: insertError } = await supabase.from('transactions').insert(data);
      if (insertError) throw insertError;
      setMessage(`Imported ${data.length} transactions`);
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    }
    setLoading(false);
  };

  return (
    <div className="bg-darkBlue border border-lightBlue p-4 rounded shadow space-y-2">
      <h3 className="font-semibold text-lightBlue">Upload CSV</h3>
      <input type="file" accept=".csv" onChange={handleFile} className="block" />
      {loading && <p className="text-gray-400">Processing…</p>}
      {error && <p className="text-red-400">{error}</p>}
      {message && <p className="text-green-400">{message}</p>}
    </div>
  );
}