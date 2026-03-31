const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5002'

async function parseApiResponse(response) {
  const raw = await response.text()
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export async function getAvailableMentors(token, subject = '') {
  const params = new URLSearchParams()
  if (subject) {
    params.set('subject', subject)
  }

  const query = params.toString()
  const endpoint = query
    ? `${API_BASE_URL}/api/users/mentors?${query}`
    : `${API_BASE_URL}/api/users/mentors`

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  const data = await parseApiResponse(response)

  // If backend route is not available yet, return empty list without crashing UI.
  if (response.status === 404) {
    return []
  }

  if (!response.ok || !data?.ok) {
    const detail = data?.error || data?.message || `Failed to load mentors (HTTP ${response.status})`
    throw new Error(detail)
  }

  return data.mentors || []
}
