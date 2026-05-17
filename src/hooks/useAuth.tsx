import React, { useEffect, useState, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  ensureProfile: (u: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const ensureProfile = async (u: User) => {
    try {
      console.log('Ensuring profile for user:', u.id);
      
      // 1. First, check if a profile already exists. This avoids unnecessary insert attempts.
      const { data: existing, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', u.id)
        .maybeSingle();

      if (checkError) {
        console.warn('Error checking for existing profile:', checkError.message);
        // If we can't even check, let's try to proceed to insert anyway as a fail-safe
      }

      if (!existing) {
        console.log('No profile found, attempting to create minimal record...');
        // 2. Try to insert a minimal record. We omit 'user_id' as it reported doesn't exist.
        // We use insert instead of upsert to avoid requiring UPDATE policies if not needed.
        const { error: insertError } = await supabase.from('profiles').insert([
          { 
            id: u.id,
            username: u.email?.split('@')[0] || 'User',
            created_at: new Date().toISOString()
          }
        ]);

        if (insertError) {
          if (insertError.code === '23505') {
             console.log('Profile already exists (race condition), ignoring.');
          } else {
            console.error('Failed to insert minimal profile into profiles table:', insertError.message);
            // This is the "RLS violation" part usually.
          }
        } else {
          console.log('Profile created successfully in profiles table.');
        }
      } else {
        console.log('Profile already exists for user:', u.id);
      }
    } catch (err) {
      console.error('Exception in ensureProfile:', err);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.error('Auth Session Error:', error.message);
        }
        setSession(session);
        if (session?.user) {
          setUser(session.user);
          ensureProfile(session.user);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Auth Exception:', err);
        setLoading(false);
      });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setUser(session.user);
        ensureProfile(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut, ensureProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
