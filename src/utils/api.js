const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://back.twryd.com';

export async function apiRequest(path, { method = 'GET', token, data, params, onLogout, headers = {}, ...rest } = {}) {
  let url = BASE_URL + path;
  if (params) {
    const qs = new URLSearchParams(params).toString();
    url += '?' + qs;
  }
  const fetchHeaders = {
    Accept: 'application/json',
    ...headers,
  };
  if (token) fetchHeaders['Authorization'] = `Bearer ${token}`;
  if (data && !(data instanceof FormData)) fetchHeaders['Content-Type'] = 'application/json';
  const body = data ? (data instanceof FormData ? data : JSON.stringify(data)) : undefined;
  const res = await fetch(url, {
    method,
    headers: fetchHeaders,
    body,
    ...rest,
  });
  if (res.status === 401 || res.status === 403) {
    if (onLogout) onLogout();
    throw new Error('Session expired. Please log in again.');
  }
  let json;
  try {
    json = await res.json();
  } catch {
    json = {};
  }
  if (!res.ok) {
    throw new Error(json.message || 'Request failed');
  }
  return json;
}

export function get(path, opts) {
  return apiRequest(path, { ...opts, method: 'GET' });
}
export function post(path, opts) {
  return apiRequest(path, { ...opts, method: 'POST' });
}
export function put(path, opts) {
  return apiRequest(path, { ...opts, method: 'PUT' });
}
export function patch(path, opts) {
  return apiRequest(path, { ...opts, method: 'PATCH' });
}
export function del(path, opts) {
  return apiRequest(path, { ...opts, method: 'DELETE' });
} 