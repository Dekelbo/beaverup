import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

const WorkspaceSessionContext = createContext(null);
const SESSION_KEY_PREFIX = 'beaverup-workspace-session-';

// --- Load this user's saved in-progress practice session, if any ---
function getStoredSession(userId) {
  if (!userId) {
    return null;
  }

  try {
    const saved = window.localStorage.getItem(`${SESSION_KEY_PREFIX}${userId}`);
    return saved ? JSON.parse(saved) : null;
  } catch (err) {
    return null;
  }
}

// --- Keep the Workspace's current conversation alive across navigation ---
function WorkspaceSessionProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.userId || null;
  const [session, setSession] = useState(() => getStoredSession(userId));

  useEffect(() => {
    setSession(getStoredSession(userId));
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    try {
      if (session) {
        window.localStorage.setItem(`${SESSION_KEY_PREFIX}${userId}`, JSON.stringify(session));
      } else {
        window.localStorage.removeItem(`${SESSION_KEY_PREFIX}${userId}`);
      }
    } catch (err) {
      // Storage can fail (private browsing, quota) - the session just won't persist this time.
    }
  }, [session, userId]);

  const value = useMemo(() => ({ session, setSession }), [session]);

  return <WorkspaceSessionContext.Provider value={value}>{children}</WorkspaceSessionContext.Provider>;
}

// --- Read workspace session context safely ---
function useWorkspaceSession() {
  const context = useContext(WorkspaceSessionContext);

  if (!context) {
    throw new Error('useWorkspaceSession must be used inside WorkspaceSessionProvider');
  }

  return context;
}

export { WorkspaceSessionProvider, useWorkspaceSession };
