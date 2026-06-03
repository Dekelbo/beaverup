import { createContext, useContext, useMemo, useState } from 'react';
import { getStoredUser, loginUser, logoutUser, signupUser } from '../services/api';

const AuthContext = createContext(null);

// --- Provide mock auth state ---
function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);

  // --- Login and store user ---
  async function login(credentials) {
    const loggedInUser = await loginUser(credentials);
    setUser(loggedInUser);
    return loggedInUser;
  }

  // --- Signup and store user ---
  async function signup(signupData) {
    const signedUpUser = await signupUser(signupData);
    setUser(signedUpUser);
    return signedUpUser;
  }

  // --- Logout and clear user ---
  async function logout() {
    await logoutUser();
    setUser(null);
  }

  const value = useMemo(
    () => ({
      isLoggedIn: Boolean(user),
      login,
      logout,
      signup,
      user
    }),
    [user]
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
