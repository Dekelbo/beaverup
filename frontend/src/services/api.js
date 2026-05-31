// --- Backend API base URL ---
const API_BASE_URL = 'http://localhost:3000';
const CURRENT_USER_ID = 2;
const AUTH_HEADERS = {
  'x-user-role': 'admin',
  'x-user-id': String(CURRENT_USER_ID)
};

// --- Send a backend request ---
async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...AUTH_HEADERS,
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

// --- Get current mock user ---
function getCurrentUser() {
  return apiRequest(`/users/${CURRENT_USER_ID}`);
}

// --- Update current mock user ---
function updateCurrentUser(user) {
  return apiRequest(`/users/${CURRENT_USER_ID}`, {
    method: 'PUT',
    body: JSON.stringify(user)
  });
}

// --- Get current user's learning items ---
function getLearningItems() {
  return apiRequest(`/learning-items/user/${CURRENT_USER_ID}`);
}

// --- Get current user's interactions ---
function getInteractions() {
  return apiRequest(`/interactions/user/${CURRENT_USER_ID}`);
}

export { API_BASE_URL, CURRENT_USER_ID, getCurrentUser, getInteractions, getLearningItems, updateCurrentUser };
