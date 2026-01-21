import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase, signIn, signUp, signOut, getProfile } from '../lib/supabase';

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_admin: boolean;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  
  // Actions
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string; session?: Session | null }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  initialize: async () => {
    try {
      set({ isLoading: true });
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Fetch profile
        const { data: profile } = await getProfile(session.user.id);
        set({ 
          session, 
          user: session.user, 
          profile: profile as Profile | null,
          isInitialized: true,
          isLoading: false 
        });
      } else {
        set({ isInitialized: true, isLoading: false });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile } = await getProfile(session.user.id);
          set({ 
            session, 
            user: session.user, 
            profile: profile as Profile | null 
          });
        } else if (event === 'SIGNED_OUT') {
          set({ session: null, user: null, profile: null });
        }
      });
    } catch (error: any) {
      console.error('Auth initialization error:', error);
      
      // If refresh token is invalid, clear session and sign out
      if (error?.message?.includes('Invalid Refresh Token') || error?.message?.includes('Refresh Token Not Found')) {
        await supabase.auth.signOut();
        set({ 
          session: null, 
          user: null, 
          profile: null,
          isInitialized: true, 
          isLoading: false 
        });
        return;
      }

      set({ 
        isInitialized: true, 
        isLoading: false, 
        error: 'Oturum başlatılamadı' 
      });
    }
  },

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await signIn(email, password);
      
      if (error) {
        set({ isLoading: false, error: error.message });
        return { success: false, error: error.message };
      }

      if (data.session?.user) {
        const { data: profile } = await getProfile(data.session.user.id);
        set({ 
          session: data.session, 
          user: data.session.user, 
          profile: profile as Profile | null,
          isLoading: false 
        });
      }

      return { success: true };
    } catch (error) {
      const message = 'Giriş başarısız';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  register: async (email: string, password: string, fullName: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await signUp(email, password, fullName);
      
      if (error) {
        set({ isLoading: false, error: error.message });
        return { success: false, error: error.message };
      }

      if (data.session?.user) {
        const { data: profile } = await getProfile(data.session.user.id);
        set({ 
          session: data.session, 
          user: data.session.user, 
          profile: profile as Profile | null,
          isLoading: false 
        });
      }

      set({ isLoading: false });
      return { success: true, session: data.session };
    } catch (error) {
      const message = 'Kayıt başarısız';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      await signOut();
      set({ 
        session: null, 
        user: null, 
        profile: null, 
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false, error: 'Çıkış başarısız' });
    }
  },

  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;
    
    try {
      const { data: profile } = await getProfile(user.id);
      set({ profile: profile as Profile | null });
    } catch (error) {
      console.error('Profile refresh error:', error);
    }
  },

  clearError: () => set({ error: null }),
}));
