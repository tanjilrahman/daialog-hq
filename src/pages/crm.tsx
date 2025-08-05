import { useState } from 'react';
import CompanyList from '@/components/CRM/CompanyList';
import ContactList from '@/components/CRM/ContactList';
import { Company } from '@/lib/types';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function CRMPage() {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  return (
    <ProtectedRoute>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h1 className="text-xl font-bold mb-2 text-lightBlue">Companies</h1>
          <CompanyList onSelect={(company) => setSelectedCompany(company)} />
        </div>
        <div>
          {selectedCompany ? (
            <>
              <h2 className="text-xl font-bold mb-2 text-lightBlue">Contacts for {selectedCompany.name}</h2>
              <ContactList companyId={selectedCompany.id} />
            </>
          ) : (
            <p className="text-gray-400">Select a company to view contacts.</p>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}