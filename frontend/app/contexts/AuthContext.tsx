'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, AuthChangeEvent } from '@supabase/supabase-js';

export type UserRole = 'student' | 'admin' | 'recruiter' | 'mentor';

const USER_SELECT = 'user_id, user_uid, name, email, role, credits';

interface UserProfile {
  user_id: number | string;
  name: string;
  email: string;
  role: UserRole;
  credits?: number;
  created_at?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  // Prevent onAuthStateChange from double-loading when login() already loaded the profile
  const skipNextSignIn = useRef(false);

  /**
   * Fetch or auto-create the user profile via server-side API.
   * Uses supabaseAdmin on the server — bypasses RLS completely.
   */
  async function loadUserProfile(authUser: any): Promise<void> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.name,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('[Auth] Profile API error:', err.error);
        setUser(null);
        return;
      }

      const { user: profile } = await res.json();
      setUser(profile ?? null);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.error('[Auth] Profile fetch timed out');
      } else {
        console.error('[Auth] loadUserProfile error:', err.message);
      }
      setUser(null);
    }
  }

  const refreshUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) await loadUserProfile(session.user);
  };

  // ---------- INITIAL SESSION & LISTENER ----------
  useEffect(() => {
    let isMounted = true;
    let subscription: { unsubscribe: () => void } | null = null;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session?.user && isMounted) {
          await loadUserProfile(session.user);
        } else if (isMounted) {
          setUser(null);
        }
      } catch (err: any) {
        console.error('[Auth] initializeAuth error:', err.message);
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // Fire-and-forget — errors already handled inside
    initializeAuth().catch((err) =>
      console.error('[Auth] Unexpected initializeAuth rejection:', err)
    );

    // Wrap in try-catch: if Supabase is misconfigured this throws synchronously
    // and would otherwise bubble straight to the AuthErrorBoundary
    try {
      const { data } = supabase.auth.onAuthStateChange(
        async (event: AuthChangeEvent, session: Session | null) => {
          if (!isMounted) return;

          if (event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') return;

          if (event === 'SIGNED_OUT') {
            setUser(null);
            return;
          }

          if (event === 'SIGNED_IN') {
            if (skipNextSignIn.current) {
              skipNextSignIn.current = false;
              return;
            }
            if (session?.user) await loadUserProfile(session.user);
            return;
          }

          if (session?.user) {
            await loadUserProfile(session.user);
          } else {
            setUser(null);
          }
        }
      );
      subscription = data.subscription;
    } catch (err: any) {
      console.error('[Auth] onAuthStateChange setup failed:', err.message);
      // Auth listener couldn't be set up — app still works, just no live session updates
    }

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // ---------- LOGIN ----------
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) throw new Error(error.message);

      if (data.session?.user) {
        // Tell the listener not to double-fetch
        skipNextSignIn.current = true;
        await loadUserProfile(data.session.user);
        setLoading(false);
        return true;
      }

      setLoading(false);
      return false;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // ---------- REGISTER ----------
  const register = async (name: string, email: string, password: string, role: UserRole = 'student') => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new Error('Password must be at least 8 characters and include uppercase, lowercase, number, and special character.');
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    });

    if (error) { setLoading(false); throw new Error(error.message); }

    if (data.user?.email) {
      await supabase
        .from('users')
        .insert([{ email, name, role, credits: 50, user_uid: data.user.id }])
        .select(USER_SELECT)
        .single();
    }

    setLoading(false);
  };

  // ---------- LOGOUT ----------
  const logout = async () => {
    try {
      setUser(null); // Clear immediately for instant UI response
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) console.error('[Auth] Sign out error:', error.message);
    } catch (err) {
      console.error('[Auth] Logout failed:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
