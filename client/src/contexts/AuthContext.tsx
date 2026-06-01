import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import AuthService from '../services/AuthService';

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  profile_picture?: string;
  gender?: { gender: string };
  role: 'admin' | 'user';
}

export interface RegisterPayload {
  username: string;
  password: string;
  password_confirmation: string;
  first_name: string;
  last_name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Map API role (admin | customer) to client role (admin | user). */
const normalizeRole = (apiUser: {
  role?: string;
  username: string;
}): 'admin' | 'user' => {
  if (apiUser.role === 'admin') return 'admin';
  // Legacy seeded admin before role column was set
  if (apiUser.username?.toLowerCase() === 'johndoe') return 'admin';
  return 'user';
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('auth_token'),
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // On mount, try restoring session from saved token
  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem('auth_token');
      if (savedToken) {
        try {
          const res = await AuthService.me();
          setUser({
            ...res.data.user,
            role: normalizeRole(res.data.user),
          });
          setToken(savedToken);
        } catch {
          localStorage.removeItem('auth_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    restoreSession();
  }, []);

  const applySession = (newToken: string, newUser: Record<string, unknown>) => {
    const normalizedUser: User = {
      ...(newUser as unknown as User),
      role: normalizeRole(newUser as { role?: string; username: string }),
    };
    localStorage.setItem('auth_token', newToken);
    setToken(newToken);
    setUser(normalizedUser);
    return normalizedUser;
  };

  const login = async (username: string, password: string) => {
    const res = await AuthService.login({ username, password });
    const { token: newToken, user: newUser } = res.data;
    return applySession(newToken, newUser);
  };

  const register = async (payload: RegisterPayload) => {
    const res = await AuthService.register(payload);
    const { token: newToken, user: newUser } = res.data;
    return applySession(newToken, newUser);
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } catch {
      // ignore network errors during logout
    } finally {
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
    }
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export default AuthContext;
