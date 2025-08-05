import type { AppProps } from 'next/app';
import { useEffect, useState, createContext, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { UserRole } from '@/lib/types';
import Navbar from '@/components/Navbar';
import '@/styles/globals.css';

interface IUserContext {
  session: Session | null;
  user: User | null;
  role: UserRole | null;
}

// Default context
export const UserContext = createContext<IUserContext>({
  session: null,
  user: null,
  role: null,
});

export function useUser() {
  return useContext(UserContext);
}

/**
 * Root component for the application.  Provides global authentication state
 * and renders the navigation bar.  Each page can access the user via
 * `useUser()`.
 */
export default function MyApp({ Component, pageProps }: AppProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);

  // Listen for auth changes
  useEffect(() => {
    const getInitialSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
    };
    getInitialSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch the user's role whenever the user changes
  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setRole(null);
        return;
      }
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      if (error) {
        console.warn('Unable to fetch role', error.message);
        setRole(null);
      } else {
        setRole(data?.role as UserRole);
      }
    };
    fetchRole();
  }, [user]);

  const ctx: IUserContext = {
    session,
    user,
    role,
  };

  return (
    <UserContext.Provider value={ctx}>
      <div className="min-h-screen bg-darkBlue text-daialogWhite">
        <Navbar />
        <main className="p-4">
          <Component {...pageProps} />
        </main>
      </div>
    </UserContext.Provider>
  );
}