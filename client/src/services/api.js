const API_BASE = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

export const api = {
  // Auth
  register: async (name, email, password, confirm_password) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, confirm_password }),
    });
    return res.json();
  },

  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.json();
  },

  // Projects
  getAllProjects: async () => {
    const res = await fetch(`${API_BASE}/projects`);
    return res.json();
  },

  getProjectById: async (id) => {
    const res = await fetch(`${API_BASE}/projects/${id}`);
    return res.json();
  },

  uploadProject: async (title, github_link, demo_link, description, tech_stack, price) => {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ title, github_link, demo_link, description, tech_stack, price }),
    });
    return res.json();
  },

  getCreatorProjects: async () => {
    const res = await fetch(`${API_BASE}/projects/creator/my-projects`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.json();
  },

  upvoteProject: async (id) => {
    const res = await fetch(`${API_BASE}/projects/${id}/upvote`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.json();
  },

  updateProject: async (id, title, description, price, tech_stack, demo_link) => {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ title, description, price, tech_stack, demo_link }),
    });
    return res.json();
  },

  deleteProject: async (id) => {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.json();
  },

  // Creator Requests
  submitCreatorRequest: async (sample_work_link, message) => {
    const res = await fetch(`${API_BASE}/creator/submit-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ sample_work_link, message }),
    });
    return res.json();
  },

  getMyRequest: async () => {
    const res = await fetch(`${API_BASE}/creator/my-request`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.json();
  },

  // Admin
  getPendingRequests: async () => {
    const res = await fetch(`${API_BASE}/creator/requests/pending`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.json();
  },

  getAllRequests: async () => {
    const res = await fetch(`${API_BASE}/creator/requests/all`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.json();
  },

  approveRequest: async (id) => {
    const res = await fetch(`${API_BASE}/creator/requests/${id}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.json();
  },

  rejectRequest: async (id) => {
    const res = await fetch(`${API_BASE}/creator/requests/${id}/reject`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.json();
  },

  getAllUsers: async () => {
    const res = await fetch(`${API_BASE}/creator/admin/users`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.json();
  },
};
