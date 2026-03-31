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

export async function getMentorAssignedStudents(token) {
  const response = await fetch(`${API_BASE_URL}/api/users/mentor/students`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  const data = await parseApiResponse(response)

  if (response.status === 404) {
    return {
      students: [],
      totals: { assignedStudents: 0, totalStudents: 0, totalMentors: 0 },
    }
  }

  if (!response.ok || !data?.ok) {
    const detail = data?.error || data?.message || `Failed to load assigned students (HTTP ${response.status})`
    throw new Error(detail)
  }

  return {
    students: data.students || [],
    totals: data.totals || { assignedStudents: 0, totalStudents: 0, totalMentors: 0 },
  }
}
