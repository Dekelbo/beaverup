// --- Backend API base URL ---
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';
const AUTH_USER_KEY = 'beaverup-user';

// --- Read stored mock auth user ---
function getStoredUser() {
  const savedUser = window.localStorage.getItem(AUTH_USER_KEY);
  return savedUser ? JSON.parse(savedUser) : null;
}

// --- Save mock auth user ---
function setStoredUser(user) {
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

// --- Clear mock auth user ---
function clearStoredUser() {
  window.localStorage.removeItem(AUTH_USER_KEY);
}

// --- Build mock auth headers ---
function getAuthHeaders() {
  const user = getStoredUser();

  if (!user) {
    return {};
  }

  return {
    'x-user-role': user.userRole,
    'x-user-id': String(user.userId)
  };
}

// --- Send a backend request ---
async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error?.message || 'Request failed.');
  }

  return result.data;
}

// --- Login mock user ---
async function loginUser(credentials) {
  const user = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
  setStoredUser(user);
  return user;
}

// --- Signup mock user ---
async function signupUser(signupData) {
  const user = await apiRequest('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(signupData)
  });
  setStoredUser(user);
  return user;
}

// --- Logout mock user ---
async function logoutUser() {
  await apiRequest('/api/auth/logout', { method: 'POST' });
  clearStoredUser();
}

// --- Get current mock user ---
function getCurrentUser() {
  return apiRequest('/api/users/me');
}

// --- Update current mock user ---
function updateCurrentUser(user) {
  const currentUser = getStoredUser();
  return apiRequest(`/users/${currentUser.userId}`, {
    method: 'PUT',
    body: JSON.stringify(user)
  }).then(updatedUser => {
    setStoredUser(updatedUser);
    return updatedUser;
  });
}

// --- Get current user's learning items ---
function getLearningItems() {
  const currentUser = getStoredUser();
  return apiRequest(`/learning-items/user/${currentUser.userId}`);
}

// --- Create a learning item ---
function createLearningItem(item) {
  const currentUser = getStoredUser();
  return apiRequest('/learning-items', {
    method: 'POST',
    body: JSON.stringify({
      userId: currentUser.userId,
      ...item
    })
  });
}

// --- Update a learning item ---
function updateLearningItem(itemId, item) {
  return apiRequest(`/learning-items/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify(item)
  });
}

// --- Delete a learning item ---
function deleteLearningItem(itemId) {
  return apiRequest(`/learning-items/${itemId}`, {
    method: 'DELETE'
  });
}

// --- Get current user's interactions ---
function getInteractions() {
  const currentUser = getStoredUser();
  return apiRequest(`/interactions/user/${currentUser.userId}`);
}

// --- Create a practice interaction ---
function createInteraction(interaction) {
  const currentUser = getStoredUser();
  return apiRequest('/interactions', {
    method: 'POST',
    body: JSON.stringify({
      userId: currentUser.userId,
      ...interaction
    })
  });
}

// --- Delete a practice interaction ---
function deleteInteraction(interactionId) {
  return apiRequest(`/interactions/${interactionId}`, {
    method: 'DELETE'
  });
}

export {
  API_BASE_URL,
  clearStoredUser,
  createInteraction,
  createLearningItem,
  deleteInteraction,
  deleteLearningItem,
  getCurrentUser,
  getInteractions,
  getLearningItems,
  getStoredUser,
  loginUser,
  logoutUser,
  setStoredUser,
  signupUser,
  updateLearningItem,
  updateCurrentUser
};
