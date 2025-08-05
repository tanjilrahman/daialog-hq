import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { TaggingRule } from '@/lib/types';

/**
 * UI for managing automatic tagging rules.  Users can add new rules by
 * specifying keywords, merchant names, amount ranges and categories/tags.  Rules
 * are stored in the `tagging_rules` table and applied to new transactions via
 * backend logic.
 */
export default function RulesEditor() {
  const [rules, setRules] = useState<TaggingRule[]>([]);
  const [form, setForm] = useState<Partial<TaggingRule>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRules = async () => {
    const { data, error } = await supabase.from('tagging_rules').select('*').order('id', { ascending: true });
    if (!error && data) setRules(data as TaggingRule[]);
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const addRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const payload = {
      keyword: form.keyword || null,
      merchant: form.merchant || null,
      min_amount: form.min_amount || null,
      max_amount: form.max_amount || null,
      category: form.category || null,
      tags: form.tags ? (form.tags as string[]).filter(Boolean) : null,
    };
    const { error } = await supabase.from('tagging_rules').insert(payload);
    if (error) setError(error.message);
    else {
      setForm({});
      await fetchRules();
    }
    setLoading(false);
  };

  const deleteRule = async (id: number) => {
    await supabase.from('tagging_rules').delete().eq('id', id);
    await fetchRules();
  };

  return (
    <div className="bg-darkBlue border border-lightBlue p-4 rounded shadow space-y-2">
      <h3 className="font-semibold text-lightBlue">Tagging Rules</h3>
      <form onSubmit={addRule} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input
          type="text"
          placeholder="Keyword"
          value={form.keyword || ''}
          onChange={(e) => setForm((prev) => ({ ...prev, keyword: e.target.value }))}
          className="px-2 py-1 text-darkBlue rounded"
        />
        <input
          type="text"
          placeholder="Merchant"
          value={form.merchant || ''}
          onChange={(e) => setForm((prev) => ({ ...prev, merchant: e.target.value }))}
          className="px-2 py-1 text-darkBlue rounded"
        />
        <input
          type="number"
          placeholder="Min amount"
          value={form.min_amount?.toString() || ''}
          onChange={(e) => setForm((prev) => ({ ...prev, min_amount: parseFloat(e.target.value) }))}
          className="px-2 py-1 text-darkBlue rounded"
        />
        <input
          type="number"
          placeholder="Max amount"
          value={form.max_amount?.toString() || ''}
          onChange={(e) => setForm((prev) => ({ ...prev, max_amount: parseFloat(e.target.value) }))}
          className="px-2 py-1 text-darkBlue rounded"
        />
        <input
          type="text"
          placeholder="Category"
          value={form.category || ''}
          onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
          className="px-2 py-1 text-darkBlue rounded"
        />
        <input
          type="text"
          placeholder="Tags (pipe separated)"
          value={Array.isArray(form.tags) ? (form.tags as string[]).join('|') : ''}
          onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value.split('|') }))}
          className="px-2 py-1 text-darkBlue rounded"
        />
        <button type="submit" disabled={loading} className="bg-lightBlue text-darkBlue px-3 py-1 rounded shadow col-span-full sm:col-auto">
          {loading ? 'Saving…' : 'Add Rule'}
        </button>
        {error && <p className="text-red-400 col-span-full">{error}</p>}
      </form>
      <table className="w-full text-left border-collapse mt-2">
        <thead>
          <tr>
            <th className="px-2 py-1 border-b border-lightBlue">Keyword</th>
            <th className="px-2 py-1 border-b border-lightBlue">Merchant</th>
            <th className="px-2 py-1 border-b border-lightBlue">Amount Range</th>
            <th className="px-2 py-1 border-b border-lightBlue">Category</th>
            <th className="px-2 py-1 border-b border-lightBlue">Tags</th>
            <th className="px-2 py-1 border-b border-lightBlue">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((rule) => (
            <tr key={rule.id} className="hover:bg-darkBlue/50">
              <td className="px-2 py-1 border-b border-lightBlue">{rule.keyword}</td>
              <td className="px-2 py-1 border-b border-lightBlue">{rule.merchant}</td>
              <td className="px-2 py-1 border-b border-lightBlue">
                {rule.min_amount || rule.max_amount
                  ? `${rule.min_amount ?? ''} – ${rule.max_amount ?? ''}`
                  : ''}
              </td>
              <td className="px-2 py-1 border-b border-lightBlue">{rule.category}</td>
              <td className="px-2 py-1 border-b border-lightBlue">{(rule.tags ?? []).join(', ')}</td>
              <td className="px-2 py-1 border-b border-lightBlue">
                <button
                  onClick={() => deleteRule(rule.id)}
                  className="text-red-400 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}