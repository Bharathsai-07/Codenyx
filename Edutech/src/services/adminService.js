const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5002'

export async function getAdminUsers(token) {
  const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  const data = await response.json()

  if (!response.ok || !data?.ok) {
    const detail = data?.error || data?.message || `Failed to load admin users (HTTP ${response.status})`
    throw new Error(detail)
  }

  return data
}

export async function updateAdminUserRole(token, userId, role) {
  const response = await fetch(`${API_BASE_URL}/api/admin/users/${encodeURIComponent(userId)}/role`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ role }),
  })

  const data = await response.json()

  if (!response.ok || !data?.ok) {
    const detail = data?.error || data?.message || `Failed to update user role (HTTP ${response.status})`
    throw new Error(detail)
  }

  return data
}
