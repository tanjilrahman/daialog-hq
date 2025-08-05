import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Company } from '@/lib/types';

interface Props {
  onSelect: (company: Company) => void;
}

export default function CompanyList({ onSelect }: Props) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [name, setName] = useState('');
  const [status, setStatus] = useState('new');
  const [loading, setLoading] = useState(false);

  const fetchCompanies = async () => {
    const { data, error } = await supabase.from('companies').select('*').order('created_at', { ascending: false });
    if (!error && data) setCompanies(data as Company[]);
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const addCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('companies').insert({ name, status });
    if (!error) {
      setName('');
      setStatus('new');
      await fetchCompanies();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={addCompany} className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Company name"
          required
          className="flex-1 px-3 py-2 text-darkBlue rounded"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-2 py-2 text-darkBlue rounded">
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </select>
        <button type="submit" disabled={loading} className="bg-lightBlue text-darkBlue px-3 py-2 rounded shadow">
          {loading ? 'Adding…' : 'Add'}
        </button>
      </form>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <th className="px-2 py-1 border-b border-lightBlue">Name</th>
            <th className="px-2 py-1 border-b border-lightBlue">Status</th>
            <th className="px-2 py-1 border-b border-lightBlue">Actions</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr key={company.id} className="hover:bg-darkBlue/50">
              <td className="px-2 py-1 border-b border-lightBlue">{company.name}</td>
              <td className="px-2 py-1 border-b border-lightBlue capitalize">{company.status}</td>
              <td className="px-2 py-1 border-b border-lightBlue">
                <button
                  onClick={() => onSelect(company)}
                  className="text-lightBlue hover:underline"
                >
                  View Contacts
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}