import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export function useProfile() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const resolveUsername = async () => {
      if (!user) {
        setDisplayName('');
        setLoading(false);
        return;
      }

      try {
        // Priority 1: check profiles table
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .maybeSingle();

        if (!error && profile?.username && profile.username.trim() !== '') {
          setDisplayName(profile.username);
          setLoading(false);
          return;
        }

        // Priority 2: check user_metadata set during signup
        const metaUsername = user.user_metadata?.username;
        if (metaUsername && metaUsername.trim() !== '') {
          setDisplayName(metaUsername);
          setLoading(false);
          return;
        }

        // Priority 3: last resort — use email prefix
        setDisplayName(user.email?.split('@')[0] ?? 'there');
      } catch (err) {
        console.error('Error resolving username:', err);
        setDisplayName(user.email?.split('@')[0] ?? 'there');
      } finally {
        setLoading(false);
      }
    };

    resolveUsername();
  }, [user]);

  return { displayName, loading, user };
}
