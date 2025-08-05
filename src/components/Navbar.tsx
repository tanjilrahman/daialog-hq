import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from '@/pages/_app';
import { useRouter } from 'next/router';
import { useState } from 'react';

/**
 * Top navigation bar.  Shows module links based on the user's role and a
 * sign‑in/out button.  Adjust the routes or add icons as needed.
 */
export default function Navbar() {
  const { user, role } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
    router.push('/login');
  };

  return (
    <nav className="bg-darkBlue border-b border-lightBlue p-4 flex items-center justify-between">
      {/* Left side: company logo and navigation links. The logo uses the uploaded PNG in the public folder. */}
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/daialog-logo.png"
            alt="Daialog logo"
            className="h-8 w-auto"
          />
          <span className="sr-only">Daialog HQ</span>
        </Link>
        {role && (
          <>
            <Link href="/" className="hover:text-lightBlue">Dashboard</Link>
            <Link href="/crm" className="hover:text-lightBlue">CRM</Link>
            {(role === 'admin' || role === 'developer') && (
              <Link href="/accounting" className="hover:text-lightBlue">Accounting</Link>
            )}
            {(role === 'admin' || role === 'developer') && (
              <Link href="/payroll" className="hover:text-lightBlue">Payroll</Link>
            )}
            <Link href="/tasks" className="hover:text-lightBlue">Tasks</Link>
          </>
        )}
      </div>
      {/* Right side: sign in/out button */}
      <div>
        {user ? (
          <button
            onClick={handleLogout}
            disabled={loading}
            className="bg-lightBlue text-darkBlue px-3 py-1 rounded shadow hover:bg-white hover:text-darkBlue transition"
          >
            {loading ? 'Signing out…' : 'Sign Out'}
          </button>
        ) : (
          <Link href="/login" className="bg-lightBlue text-darkBlue px-3 py-1 rounded shadow hover:bg-white hover:text-darkBlue transition">Sign In</Link>
        )}
      </div>
    </nav>
  );
}