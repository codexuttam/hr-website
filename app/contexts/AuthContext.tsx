'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, AuthChangeEvent } from '@supabase/supabase-js';

export type UserRole = 'student' | 'admin' | 'recruiter' | 'mentor';

interface UserProfile {
  user_id: number | string;
  name: string;
  email: string;
  role: UserRole;
  credits?: number;
  created_at: string;
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

  // Load "users" table profile with timeout protection
  async function loadUserProfile(authUser: any) {
    // console.log('[Auth] loadUserProfile called for:', authUser.email);

    // Create a timeout that will reject after 5 seconds
    // const timeoutPromise = new Promise<never>((_, reject) => {
    //   setTimeout(() => reject(new Error('Database query timeout - check RLS policies')), 5000);
    // });

    try {
      // 1. Try finding by user_uid (Fastest, Correct)
      // console.log('[Auth] Querying by user_uid...');
      const { data, error } = await Promise.race([
        supabase
          .from('users')
          .select('*')
          .eq('user_uid', authUser.id)
          .single(),
        // timeoutPromise
      ]);

      console.log('[Auth] Query by user_uid result:', { found: !!data, error: error?.message });

      if (!error && data) {
        console.log('[Auth] User found by user_uid');
        setUser(data);
        return;
      }

      // 2. Fallback: Find by email (Legacy support)
      if (authUser.email) {
        //console.log('[Auth] Querying by email...');
        const { data: byEmail, error: emailError } = await Promise.race([
          supabase
            .from('users')
            .select('*')
            .eq('email', authUser.email)
            .single(),
          // timeoutPromise
        ]);

        //console.log('[Auth] Query by email result:', { found: !!byEmail, error: emailError?.message });

        if (!emailError && byEmail) {
          // Optional: Update user_uid for consistency
          if (!byEmail.user_uid) {
            await supabase.from('users').update({ user_uid: authUser.id }).eq('user_id', byEmail.user_id);
            byEmail.user_uid = authUser.id;
          }
          //console.log('[Auth] User found by email');
          setUser(byEmail);
          return;
        }
      }

      // 3. Auto-create missing profile
      // console.log('[Auth] Creating new user profile...');
      const { data: newUser, error: insertError } = await Promise.race([
        supabase
          .from('users')
          .insert([
            {
              email: authUser.email,
              name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
              role: 'student',
              credits: 50,
              user_uid: authUser.id
            }
          ])
          .select()
          .single(),
        // timeoutPromise
      ]);

      //console.log('[Auth] New user created:', { success: !!newUser, error: insertError?.message });

      // Handle insert error - might be a duplicate key error
      if (insertError) {
        //console.error('[Auth] Insert error occurred:', insertError.message);

        // If it's a duplicate error, try to fetch the existing user one more time
        if (insertError.message.includes('duplicate') || insertError.code === '23505') {
          console.log('[Auth] Duplicate detected, re-fetching user...');
          const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .or(`user_uid.eq.${authUser.id},email.eq.${authUser.email}`)
            .single();

          if (existingUser) {
            //console.log('[Auth] Found existing user after duplicate error');
            setUser(existingUser);
            return;
          }
        }

        // If still no user, set to null (will cause redirect to login)
        //console.error('[Auth] Could not create or find user profile');
        setUser(null);
        return;
      }

      // Success - set the new user
      if (newUser) {
        //console.log('[Auth] User profile created successfully:', newUser.email);
        setUser(newUser);
      } else {
        //console.error('[Auth] newUser is null despite no insert error');
        setUser(null);
      }
    } catch (err: any) {
      console.error('[Auth] loadUserProfile failed:', err.message);
      // On timeout or error, set user to null - user will be redirected to login
      setUser(null);
    }
  }

  const refreshUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await loadUserProfile(session.user);
    }
  };

  // ---------- INITIAL SESSION & LISTENER ----------
  useEffect(() => {
    let isMounted = true;

    // Initialize auth state with explicit getSession call
    const initializeAuth = async () => {
      //console.log('[Auth] Starting initializeAuth...');
      try {
        //console.log('[Auth] Calling getSession...');
        const { data: { session }, error } = await supabase.auth.getSession();
        //console.log('[Auth] getSession result:', { hasSession: !!session, error });

        if (error) {
          console.error('[Auth] Error getting session:', error);
          if (isMounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        if (session?.user && isMounted) {
          //console.log('[Auth] Session found, loading user profile...');
          await loadUserProfile(session.user);
          //console.log('[Auth] User profile loaded');
        } else if (isMounted) {
          //console.log('[Auth] No session found');
          setUser(null);
        }
      } catch (error) {
        //console.error('[Auth] Error initializing auth:', error);
        if (isMounted) setUser(null);
      } finally {
        //console.log('[Auth] initializeAuth complete, setting loading to false');
        if (isMounted) setLoading(false);
      }
    };

    // Call getSession immediately for faster initialization
    initializeAuth();

    // Also listen for auth state changes (login/logout/token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!isMounted) return;

        console.log('Auth state changed:', event);

        // Skip profile reload for TOKEN_REFRESHED if we already have user loaded
        // This prevents unnecessary re-fetches and loading state issues
        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed, skipping profile reload');
          return;
        }

        try {
          if (session?.user) {
            await loadUserProfile(session.user);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error("Error loading user profile:", error);
          setUser(null);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ---------- LOGIN ----------
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    console.log('[Auth] Login started for:', email);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[Auth] Login error:', error.message);
        throw new Error(error.message);
      }

      if (data.session?.user) {
        console.log('[Auth] Login successful, loading user profile...');
        await loadUserProfile(data.session.user);

        // Small delay to ensure React state has updated
        await new Promise(resolve => setTimeout(resolve, 100));

        console.log('[Auth] Login complete, user state should be set');
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
    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new Error('Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.');
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role }
      }
    });

    if (error) throw new Error(error.message);

    if (data.user?.email) {
      await supabase
        .from('users')
        .insert([{
          email,
          name,
          role,
          credits: 50,
          user_uid: data.user.id // Link public user to auth user
        }])
        .select()
        .single();
    }

    setLoading(false);
  };

  // ---------- LOGOUT ----------
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
