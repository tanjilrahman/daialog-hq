import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Contact } from '@/lib/types';

interface Props {
  companyId: string;
}

export default function ContactList({ companyId }: Props) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchContacts = async () => {
    const { data, error } = await supabase.from('contacts').select('*').eq('company_id', companyId).order('created_at', { ascending: false });
    if (!error && data) setContacts(data as Contact[]);
  };

  useEffect(() => {
    fetchContacts();
  }, [companyId]);

  const addContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('contacts').insert({ company_id: companyId, name, email, phone });
    if (!error) {
      setName('');
      setEmail('');
      setPhone('');
      await fetchContacts();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4 mt-4">
      <form onSubmit={addContact} className="flex gap-2 flex-wrap">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contact name"
          required
          className="flex-1 min-w-[150px] px-3 py-2 text-darkBlue rounded"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="flex-1 min-w-[150px] px-3 py-2 text-darkBlue rounded"
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone"
          className="flex-1 min-w-[150px] px-3 py-2 text-darkBlue rounded"
        />
        <button type="submit" disabled={loading} className="bg-lightBlue text-darkBlue px-3 py-2 rounded shadow">
          {loading ? 'Adding…' : 'Add Contact'}
        </button>
      </form>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <th className="px-2 py-1 border-b border-lightBlue">Name</th>
            <th className="px-2 py-1 border-b border-lightBlue">Email</th>
            <th className="px-2 py-1 border-b border-lightBlue">Phone</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr key={contact.id} className="hover:bg-darkBlue/50">
              <td className="px-2 py-1 border-b border-lightBlue">{contact.name}</td>
              <td className="px-2 py-1 border-b border-lightBlue">{contact.email}</td>
              <td className="px-2 py-1 border-b border-lightBlue">{contact.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}