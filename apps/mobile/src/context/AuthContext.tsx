import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authLogin, authMe, authRegister } from '../lib/api';
import * as authStorage from '../lib/authStorage';
import { disconnectSocket } from '../socket';

export type Session = {
  accessToken: string;
  user: { id: string; email: string | null };
};

type Ctx = {
  session: Session | null;
  bootstrapping: boolean;
  biometricUnlockFailed: boolean;
  retryBiometricUnlock: () => Promise<void>;
  abandonBiometricUnlock: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [biometricUnlockFailed, setBiometricUnlockFailed] = useState(false);

  const restoreSession = useCallback(async () => {
    setBiometricUnlockFailed(false);
    let token: string | null;
    try {
      token = await authStorage.getAccessToken();
    } catch {
      setBiometricUnlockFailed(true);
      setSession(null);
      return;
    }
    if (!token) {
      setSession(null);
      return;
    }
    try {
      const me = await authMe(token);
      setSession({ accessToken: token, user: me.user });
    } catch {
      await authStorage.clearAccessToken();
      setSession(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await restoreSession();
      if (!cancelled) setBootstrapping(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [restoreSession]);

  const retryBiometricUnlock = useCallback(async () => {
    setBootstrapping(true);
    await restoreSession();
    setBootstrapping(false);
  }, [restoreSession]);

  const abandonBiometricUnlock = useCallback(async () => {
    await authStorage.setUseBiometricForToken(false);
    await authStorage.clearAccessToken();
    setBiometricUnlockFailed(false);
    setSession(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const r = await authLogin(email, password);
    await authStorage.setAccessToken(r.accessToken);
    setSession({ accessToken: r.accessToken, user: r.user });
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const r = await authRegister(email, password);
    await authStorage.setAccessToken(r.accessToken);
    setSession({ accessToken: r.accessToken, user: r.user });
  }, []);

  const signOut = useCallback(async () => {
    disconnectSocket();
    setBiometricUnlockFailed(false);
    await authStorage.clearAccessToken();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      bootstrapping,
      biometricUnlockFailed,
      retryBiometricUnlock,
      abandonBiometricUnlock,
      login,
      register,
      signOut,
    }),
    [
      session,
      bootstrapping,
      biometricUnlockFailed,
      retryBiometricUnlock,
      abandonBiometricUnlock,
      login,
      register,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const v = useContext(AuthContext);
  if (!v) throw new Error('useAuth outside provider');
  return v;
}
