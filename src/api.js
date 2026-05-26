// API client — calls the Express backend
const API_BASE = (window.location.hostname.includes('onrender.com'))
  ? 'https://Aisira.onrender.com/api'
  : `http://${window.location.hostname}:5000/api`;





function getToken() {
  return localStorage.getItem('yn_token');
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const { headers: optHeaders, ...restOptions } = options;
  const fetchOptions = {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...optHeaders,
    },
  };
  // Ensure POST/PATCH requests always have a body
  if ((fetchOptions.method === 'POST' || fetchOptions.method === 'PATCH') && !fetchOptions.body) {
    fetchOptions.body = JSON.stringify({});
  }
  const res = await fetch(`${API_BASE}${path}`, fetchOptions);

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  loginWithGoogle: (idToken) => request('/auth/google', { method: 'POST', body: JSON.stringify({ idToken }) }),
  register: (email, password, displayName) => request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, displayName }) }),
  verifyEmail: (email, code) => request('/auth/verify', { method: 'POST', body: JSON.stringify({ email, code }) }),
  resendVerification: (email) => request('/auth/resend-verification', { method: 'POST', body: JSON.stringify({ email }) }),
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (email, code, newPassword) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ email, code, newPassword }) }),
  getMe: () => request('/auth/me'),
  changePassword: (currentPassword, newPassword) => request('/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) }),
  getUsers: () => request('/auth/users'),
  toggleRole: (uid) => request(`/auth/users/${uid}/role`, { method: 'PATCH' }),
  toggleReminder: (eventId) => request(`/auth/reminders/${eventId}`, { method: 'POST' }),
  toggleWhatsAppReminder: (eventId, phone) => request(`/events/${eventId}/whatsapp-reminder`, { method: 'POST', body: JSON.stringify({ phone }) }),

  // Events
  getApprovedEvents: () => request('/events'),
  getPastEvents: () => request('/events/past'),
  getDeletedEvents: () => request('/events/deleted'),
  getMySubmissions: () => request('/my-submissions'),
  getEventById: (id) => request(`/events/${id}`),
  incrementViews: (id) => request(`/events/${id}/view`, { method: 'POST' }),




  getAllEvents: (status) => request(`/events/all${status ? `?status=${status}` : ''}`),
  createEvent: (data) => request('/events', { method: 'POST', body: JSON.stringify(data) }),
  updateEvent: (id, data) => request(`/events/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  approveEvent: (id) => request(`/events/${id}/approve`, { method: 'POST', body: JSON.stringify({}) }),
  rejectEvent: (id, reason) => request(`/events/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }),
  deleteEvent: (id, reason) => request(`/events/${id}/delete`, { method: 'POST', body: JSON.stringify({ reason }) }),
  revertToPending: (id) => request(`/events/${id}/pending`, { method: 'POST' }),


  resolveMapLink: (url) => request('/events/resolve-map-link', { method: 'POST', body: JSON.stringify({ url }) }),
  getStats: () => request('/events/stats'),

  // Upload
  uploadPosters: async (files) => {
    const formData = new FormData();
    files.forEach(f => formData.append('posters', f));
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: { ...authHeaders() },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data.urls;
  },
};
