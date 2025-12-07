'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export type UserRole = 'student' | 'admin' | 'recruiter' | 'mentor';

interface User {
  user_id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to save user to localStorage
  const saveUserToStorage = (userData: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hr_user', JSON.stringify(userData));
    }
  };

  // Helper function to load user from localStorage
  const loadUserFromStorage = (): User | null => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('hr_user');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (error) {
          console.error('Failed to parse stored user data:', error);
          localStorage.removeItem('hr_user');
        }
      }
    }
    return null;
  };

  // Helper function to clear user from localStorage
  const clearUserFromStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hr_user');
    }
  };

  // Helper function to validate session
  const validateSession = async (): Promise<boolean> => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.log('Session validation failed:', error.message);
        return false;
      }
      return !!user;
    } catch (validationError) {
      console.log('Session validation exception:', validationError);
      return false;
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('Checking for existing session...');

        // First check localStorage for instant load
        const storedUser = loadUserFromStorage();
        if (storedUser) {
          console.log('Found user in localStorage, loading immediately:', storedUser.name);
          setUser(storedUser);
          setLoading(false); // Set loading to false immediately
        }

        // Then verify with Supabase in background
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          if (storedUser) {
            clearUserFromStorage();
            setUser(null);
          }
          setLoading(false);
          return;
        }

        if (session && session.user?.email) {
          console.log('Found existing session for user:', session.user.email);
          setToken(session.access_token);

          // Fetch user profile with timeout
          const fetchProfile = async () => {
            const { data: userData, error } = await supabase
              .from('users')
              .select('*')
              .eq('email', session.user.email)
              .single();

            if (userData && !error) {
              console.log('User profile loaded:', userData.name);
              setUser(userData);
              saveUserToStorage(userData);
            } else {
              console.log('User profile not found, attempting to create...');
              try {
                const { data: newUser, error: createError } = await supabase
                  .from('users')
                  .insert([{
                    email: session.user.email,
                    name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                    role: session.user.user_metadata?.role || 'student'
                  }])
                  .select()
                  .single();

                if (newUser && !createError) {
                  console.log('Created missing user record:', newUser.name);
                  setUser(newUser);
                  saveUserToStorage(newUser);
                } else {
                  throw createError || new Error('Failed to create user');
                }
              } catch (err) {
                console.error('Failed to auto-create user:', err);
                // Fallback to temporary user (will fail DB operations but allow login)
                const fallbackUser: User = {
                  user_id: Math.floor(Math.random() * 1000000),
                  name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                  email: session.user.email || '',
                  role: session.user.user_metadata?.role || 'student',
                  created_at: session.user.created_at || new Date().toISOString(),
                };
                setUser(fallbackUser);
                saveUserToStorage(fallbackUser);
              }
            }
          };

          // Fetch with 2 second timeout
          await Promise.race([
            fetchProfile(),
            new Promise((resolve) => setTimeout(resolve, 2000))
          ]);
        } else {
          console.log('No existing session found');
          if (storedUser) {
            console.log('Clearing invalid stored user');
            clearUserFromStorage();
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);

      if (session && session.user?.email) {
        setToken(session.access_token);

        // Fetch user profile
        try {
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', session.user.email)
            .single();

          if (userData && !error) {
            console.log('User profile loaded on auth change:', userData.name);
            setUser(userData);
            saveUserToStorage(userData);
          } else {
            console.warn('User profile not found in database, creating fallback user. Error:', error?.message || 'No error details');
            // Create a fallback user object
            const fallbackUser: User = {
              user_id: Math.floor(Math.random() * 1000000),
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              role: session.user.user_metadata?.role || 'student',
              created_at: session.user.created_at || new Date().toISOString(),
            };
            setUser(fallbackUser);
            saveUserToStorage(fallbackUser);
          }
        } catch (profileError) {
          console.error('Exception while fetching user profile on auth change:', profileError);
          // Create a fallback user object
          const fallbackUser: User = {
            user_id: Math.floor(Math.random() * 1000000),
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            role: session.user.user_metadata?.role || 'student',
            created_at: session.user.created_at || new Date().toISOString(),
          };
          setUser(fallbackUser);
          saveUserToStorage(fallbackUser);
        }
      } else {
        console.log('Session ended, clearing user data');
        setUser(null);
        setToken(null);
        clearUserFromStorage();
      }

      // Set loading to false after any auth state change
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string, role?: UserRole) => {
    try {
      console.log('Attempting login for:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);

        // Provide helpful error messages
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please verify your email or disable email confirmation in Supabase settings');
        }
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password');
        }
        if (error.message.includes('Email link is invalid or has expired')) {
          throw new Error('Email confirmation link expired');
        }
        throw new Error(error.message);
      }

      console.log('Login successful for:', email);

      if (data.session && data.user) {
        setToken(data.session.access_token);

        // Fetch user profile from users table with timeout
        const fetchUserProfile = async () => {
          try {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('email', email)
              .single();

            if (userData && !userError) {
              console.log('User profile loaded:', userData.name);
              setUser(userData);
              saveUserToStorage(userData);
              return userData;
            } else {
              console.log('User profile not found, attempting to create...');
              const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert([{
                  email: email,
                  name: data.user.user_metadata?.name || email.split('@')[0] || 'User',
                  role: role || data.user.user_metadata?.role || 'student'
                }])
                .select()
                .single();

              if (newUser && !createError) {
                console.log('Created missing user record:', newUser.name);
                setUser(newUser);
                saveUserToStorage(newUser);
                return newUser;
              }
              throw createError;
            }
          } catch (err) {
            console.warn('Error fetching/creating user profile:', err);
          }

          // Fallback: create basic user from auth data
          console.log('Using fallback user profile');
          const basicUser: User = {
            user_id: Math.floor(Math.random() * 1000000),
            name: data.user.user_metadata?.name || email.split('@')[0] || 'User',
            email: email,
            role: role || data.user.user_metadata?.role || 'student',
            created_at: data.user.created_at || new Date().toISOString(),
          };
          setUser(basicUser);
          saveUserToStorage(basicUser);
          return basicUser;
        };

        // Fetch user profile with 3 second timeout
        await Promise.race([
          fetchUserProfile(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
          )
        ]).catch((err) => {
          console.warn('Profile fetch timed out, using fallback');
          const basicUser: User = {
            user_id: Math.floor(Math.random() * 1000000),
            name: data.user.user_metadata?.name || email.split('@')[0] || 'User',
            email: email,
            role: role || data.user.user_metadata?.role || 'student',
            created_at: data.user.created_at || new Date().toISOString(),
          };
          setUser(basicUser);
          saveUserToStorage(basicUser);
        });
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (name: string, email: string, password: string, role: string = 'student') => {
    try {
      // Sign up with Supabase Auth - it handles password hashing securely
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
          data: {
            name,
            role,
          }
        }
      });

      if (authError) {
        // Provide more helpful error messages
        if (authError.message.includes('invalid')) {
          throw new Error('Please use a valid email address (e.g., user@example.com)');
        }
        throw authError;
      }

      if (authData.user) {
        // Create user profile in users table WITHOUT password
        // Supabase Auth handles password storage securely
        const { data: userData, error: userError } = await supabase
          .from('users')
          .insert([
            {
              email,
              name,
              role,
              // DO NOT store password or password_hash here!
              // Supabase Auth manages passwords securely
            }
          ])
          .select()
          .single();

        if (userError) {
          // If user already exists in table, fetch it
          if (userError.code === '23505') {
            const { data: existingUser } = await supabase
              .from('users')
              .select('*')
              .eq('email', email)
              .single();

            if (existingUser) {
              if (authData.session) {
                setToken(authData.session.access_token);
                setUser(existingUser);
                saveUserToStorage(existingUser);
              }
              return;
            }
          }
          throw userError;
        }

        if (authData.session) {
          setToken(authData.session.access_token);
          setUser(userData);
          saveUserToStorage(userData);
        } else {
          // Email confirmation required
          throw new Error('Please check your email to confirm your account');
        }
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed';
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out user...');
      await supabase.auth.signOut();
      setUser(null);
      setToken(null);
      clearUserFromStorage();
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local state even if logout fails
      setUser(null);
      setToken(null);
      clearUserFromStorage();
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
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