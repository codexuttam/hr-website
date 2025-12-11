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
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load "users" table profile
  // Load "users" table profile
  async function loadUserProfile(authUser: any) {
    // 1. Try finding by user_uid (Fastest, Correct)
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_uid', authUser.id)
      .single();

    if (!error && data) {
      setUser(data);
      return;
    }

    // 2. Fallback: Find by email (Legacy support)
    if (authUser.email) {
      const { data: byEmail, error: emailError } = await supabase
        .from('users')
        .select('*')
        .eq('email', authUser.email)
        .single();

      if (!emailError && byEmail) {
        // Optional: Update user_uid for consistency
        if (!byEmail.user_uid) {
          await supabase.from('users').update({ user_uid: authUser.id }).eq('user_id', byEmail.user_id);
          byEmail.user_uid = authUser.id;
        }
        setUser(byEmail);
        return;
      }
    }

    // 3. Auto-create missing profile
    const { data: newUser } = await supabase
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
      .single();

    setUser(newUser);
  }

  // ---------- INITIAL SESSION & LISTENER ----------
  useEffect(() => {
    // onAuthStateChange fires immediately with INITIAL_SESSION for the current session,
    // so we don't need a separate init() + getSession() call.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          await loadUserProfile(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ---------- LOGIN ----------
  const login = async (email: string, password: string) => {
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);

    if (data.session?.user) {
      await loadUserProfile(data.session.user);
    }

    setLoading(false);
  };

  // ---------- REGISTER ----------
  const register = async (name: string, email: string, password: string, role: UserRole = 'student') => {
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
