import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signInWithOtp: (email: string) => Promise<{ error: any }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  deleteAccount: () => Promise<{ error: any }>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  signInWithOtp: async () => ({ error: null }),
  verifyOtp: async () => ({ error: null }),
  signOut: async () => ({ error: null }),
  deleteAccount: async () => ({ error: null }),
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithOtp = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: 'aerobic://', 
      },
    });
    return { error };
  };

  const verifyOtp = async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });
    return { error };
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.warn('Sign out error:', error.message);
      }
    } catch (e) {
      console.warn('Sign out exception:', e);
    } finally {
      // Force local cleanup
      setSession(null);
      setUser(null);
    }
    return { error: null };
  };

  const deleteAccount = async () => {
    if (!user) return { error: 'No user logged in' };

    // Delete user data
    const { error: workoutsError } = await supabase
      .from('workouts')
      .delete()
      .eq('user_id', user.id);
    
    if (workoutsError) return { error: workoutsError };

    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id);

    if (profileError) return { error: profileError };

    // Sign out
    return signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, isLoading, signInWithOtp, verifyOtp, signOut, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}
