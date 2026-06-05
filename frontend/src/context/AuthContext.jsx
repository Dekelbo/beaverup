import { createContext, useContext, useMemo, useState } from 'react';
import { getStoredUser, loginUser, logoutUser, signupUser } from '../services/api';

const AuthContext = createContext(null);
const AUTH_SOURCE_KEY = 'beaverup-auth-source';

// --- Read stored auth source ---
function getStoredAuthSource() {
  return window.localStorage.getItem(AUTH_SOURCE_KEY) || 'login';
}

// --- Provide mock auth state ---
function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [authSource, setAuthSource] = useState(getStoredAuthSource);

  // --- Login and store user ---
  async function login(credentials) {
    const loggedInUser = await loginUser(credentials);
    window.localStorage.setItem(AUTH_SOURCE_KEY, 'login');
    setAuthSource('login');
    setUser(loggedInUser);
    return loggedInUser;
  }

  // --- Signup and store user ---
  async function signup(signupData) {
    const signedUpUser = await signupUser(signupData);
    window.localStorage.setItem(AUTH_SOURCE_KEY, 'signup');
    setAuthSource('signup');
    setUser(signedUpUser);
    return signedUpUser;
  }

  // --- Logout and clear user ---
  async function logout() {
    await logoutUser();
    window.localStorage.removeItem(AUTH_SOURCE_KEY);
    setAuthSource('login');
    setUser(null);
  }

  const value = useMemo(
    () => ({
      authSource,
      isLoggedIn: Boolean(user),
      login,
      logout,
      signup,
      user
    }),
    [authSource, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// --- Read auth context safely ---
function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}

export { AuthProvider, useAuth };
