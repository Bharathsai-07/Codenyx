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

function withAuthHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

export async function getChatConversations(token) {
  const response = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
    method: 'GET',
    headers: withAuthHeaders(token),
  })

  const data = await parseApiResponse(response)
  if (!response.ok || !data?.ok) {
    const detail = data?.error || data?.message || `Failed to load conversations (HTTP ${response.status})`
    throw new Error(detail)
  }

  return data.conversations || []
}

export async function getStudentMentorAssignments(token) {
  const response = await fetch(`${API_BASE_URL}/api/chat/student/assignments`, {
    method: 'GET',
    headers: withAuthHeaders(token),
  })

  const data = await parseApiResponse(response)
  if (!response.ok || !data?.ok) {
    const detail = data?.error || data?.message || `Failed to load assignments (HTTP ${response.status})`
    throw new Error(detail)
  }

  return data.assignments || []
}

export async function assignMentorToStudent(token, payload) {
  const response = await fetch(`${API_BASE_URL}/api/assign-mentor`, {
    method: 'POST',
    headers: withAuthHeaders(token),
    body: JSON.stringify(payload),
  })

  const data = await parseApiResponse(response)
  if (!response.ok || !data?.ok) {
    const detail = data?.error || data?.message || `Failed to assign mentor (HTTP ${response.status})`
    throw new Error(detail)
  }

  return data.student || null
}

export async function getMentorStudents(token, mentorId) {
  const response = await fetch(`${API_BASE_URL}/api/mentor/${encodeURIComponent(mentorId)}/students`, {
    method: 'GET',
    headers: withAuthHeaders(token),
  })

  const data = await parseApiResponse(response)
  if (!response.ok || !data?.ok) {
    const detail = data?.error || data?.message || `Failed to load mentor students (HTTP ${response.status})`
    throw new Error(detail)
  }

  return data.students || []
}

export async function getThreadMessages(token, studentId, mentorId) {
  const url = new URL(`${API_BASE_URL}/api/chat/thread`)
  url.searchParams.set('studentId', String(studentId || '').trim())
  url.searchParams.set('mentorId', String(mentorId || '').trim())

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: withAuthHeaders(token),
  })

  const data = await parseApiResponse(response)
  if (!response.ok || !data?.ok) {
    const detail = data?.error || data?.message || `Failed to load thread messages (HTTP ${response.status})`
    throw new Error(detail)
  }

  return data.messages || []
}

export async function getConversationMessages(token, conversationId) {
  const response = await fetch(`${API_BASE_URL}/api/chat/messages/${encodeURIComponent(conversationId)}`, {
    method: 'GET',
    headers: withAuthHeaders(token),
  })

  const data = await parseApiResponse(response)
  if (!response.ok || !data?.ok) {
    const detail = data?.error || data?.message || `Failed to load messages (HTTP ${response.status})`
    throw new Error(detail)
  }

  return data.messages || []
}

export async function sendChatMessage(token, payload) {
  const response = await fetch(`${API_BASE_URL}/api/chat/messages`, {
    method: 'POST',
    headers: withAuthHeaders(token),
    body: JSON.stringify(payload),
  })

  const data = await parseApiResponse(response)
  if (!response.ok || !data?.ok) {
    const detail = data?.error || data?.message || `Failed to send message (HTTP ${response.status})`
    throw new Error(detail)
  }

  return {
    conversation: data.conversation,
    message: data.message,
  }
}
