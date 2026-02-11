const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export function getToken(): string | null {
  return localStorage.getItem('admin_token');
}

function getHeaders(includeAuth = true): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const token = getToken();
  if (includeAuth && token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function login(username: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: getHeaders(false),
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  if (data.data?.user?.role !== 'admin') throw new Error('Admin access required');
  return data.data;
}

export async function getMe() {
  const res = await fetch(`${API_URL}/auth/me`, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Unauthorized');
  return data.data;
}

export async function getStats() {
  const res = await fetch(`${API_URL}/admin/stats`, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load stats');
  return data.data;
}

export async function getEnrollments(status?: string) {
  const url = status ? `${API_URL}/admin/enrollments?status=${encodeURIComponent(status)}` : `${API_URL}/admin/enrollments`;
  const res = await fetch(url, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load enrollments');
  return data.data;
}

export async function getEnrollment(id: string) {
  const res = await fetch(`${API_URL}/admin/enrollments/${id}`, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load enrollment');
  return data.data;
}

export async function updateEnrollmentStatus(id: string, status: string) {
  const res = await fetch(`${API_URL}/admin/enrollments/${id}/status`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update status');
  return data.data;
}

export async function getDocuments(userId: string) {
  const res = await fetch(`${API_URL}/admin/documents/${userId}`, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load documents');
  return data.data;
}

export function setToken(token: string) {
  localStorage.setItem('admin_token', token);
}

export function clearToken() {
  localStorage.removeItem('admin_token');
}
