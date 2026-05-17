import { supabase } from '../lib/supabaseClient.js';

const demoSessionKey = 'plano-certo-session';

export function getDemoSession() {
  try {
    const value = window.localStorage.getItem(demoSessionKey);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function createDemoSession(email = 'operacao@planocerto.com.br', remember = true) {
  const session = {
    type: 'demo',
    email,
    remember,
    signedInAt: new Date().toISOString(),
  };
  window.localStorage.setItem(demoSessionKey, JSON.stringify(session));
  return session;
}

export async function getCurrentSession() {
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      return {
        type: 'supabase',
        email: data.session.user?.email || 'usuario autenticado',
        session: data.session,
      };
    }
  }

  return getDemoSession();
}

export async function signInWithEmail(email, password) {
  if (!supabase) {
    throw new Error('Supabase nao esta configurado neste ambiente.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  return {
    type: 'supabase',
    email: data.user?.email || email,
    session: data.session,
  };
}

export async function signOutSession() {
  window.localStorage.removeItem(demoSessionKey);
  if (supabase) {
    await supabase.auth.signOut();
  }
}

export function subscribeToAuthChanges(callback) {
  if (!supabase) return () => {};

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    if (!session) {
      callback(getDemoSession());
      return;
    }

    callback({
      type: 'supabase',
      email: session.user?.email || 'usuario autenticado',
      session,
    });
  });

  return () => data.subscription.unsubscribe();
}
