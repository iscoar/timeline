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
};

export default authService;
