import supabase from './supabaseService';

export const authService = {
  async sendOtp(email: string) {
    try {
      const res = await supabase.auth.signInWithOtp({ email });
      if ((res as any).error) return { data: null, error: (res as any).error };
      return { data: res, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async signInWithPassword(email: string, password: string) {
    try {
      const res = await supabase.auth.signInWithPassword({ email, password });
      if ((res as any).error) return { data: null, error: (res as any).error };
      return { data: res, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async verifyCode(email: string, token: string) {
    try {
        const res = await supabase.auth.verifyOtp({ email, token, type: 'email' });
        if ((res as any).error) return { data: null, error: (res as any).error };
        return { data: res, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async signOut() {
    try {
      await supabase.auth.signOut();
      return { error: null };
    } catch (error) {
      return { error };
    }
  }
  ,

  async signUp(email: string, password: string, metadata?: { full_name?: string }) {
    try {
      const res = await supabase.auth.signUp({ email, password, options: { data: metadata } });
      if ((res as any).error) return { data: null, error: (res as any).error };
      return { data: res, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async updateUserProfile(updates: { full_name?: string; avatar_url?: string; [k: string]: any }) {
    try {
        const res = await supabase.auth.updateUser({ data: updates });
        if ((res as any).error) return { data: null, error: (res as any).error };
        return { data: res, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async changePassword(email: string, newPassword: string) {
    try {
        const res = await supabase.auth.updateUser({ password: newPassword });
        if ((res as any).error) return { data: null, error: (res as any).error };
        return { data: res, error: null };
      
    } catch (error) {
      return { data: null, error };
    }
  }
};

export default authService;
