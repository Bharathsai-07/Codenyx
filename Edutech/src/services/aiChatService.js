const PROVIDER = import.meta.env.VITE_CHATBOT_PROVIDER || 'gemini'
const MODEL = import.meta.env.VITE_CHATBOT_MODEL || 'gemini-1.5-flash'
const API_URL = import.meta.env.VITE_CHATBOT_API_URL
  || (PROVIDER === 'gemini'
    ? `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`
    : 'https://api.openai.com/v1/chat/completions')

function buildSystemPrompt(role, language) {
  const rolePrompt = role === 'mentor'
    ? 'You are an AI mentor assistant helping teachers and mentors with student guidance, lesson planning, and explanations.'
    : 'You are an AI study assistant helping students understand concepts, solve doubts, and create simple study plans.'

  const languageInstruction = language === 'hi'
    ? 'Reply in Hindi unless asked otherwise.'
    : language === 'te'
      ? 'Reply in Telugu unless asked otherwise.'
      : 'Reply in English unless asked otherwise.'

  return `${rolePrompt} Keep responses concise, practical, and friendly. ${languageInstruction}`
}

function isGeminiEndpoint(url) {
  return PROVIDER === 'gemini' || url.includes('generativelanguage.googleapis.com')
}

function toGeminiContents(messages) {
  return messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))
}

function resolveGeminiUrl(apiUrl, model, apiKey) {
  const hasModelPath = apiUrl.includes('/models/') && apiUrl.includes(':generateContent')
  const baseUrl = hasModelPath
    ? apiUrl
    : `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

  // Some models (and/or generateContent) are only supported on v1beta.
  // If the configured URL points to v1, upgrade it to v1beta to avoid 404/NOT_FOUND.
  const normalizedBaseUrl = baseUrl.includes('/v1/models/')
    ? baseUrl.replace('/v1/models/', '/v1beta/models/')
    : baseUrl

  const url = new URL(normalizedBaseUrl)
  if (!url.searchParams.get('key')) {
    url.searchParams.set('key', apiKey)
  }
  return url.toString()
}

async function requestGemini({ apiKey, messages, role, language }) {
  const url = resolveGeminiUrl(API_URL, MODEL, apiKey)
  const systemPrompt = buildSystemPrompt(role, language)

  const geminiMessages = [
    { role: 'user', content: `System instructions: ${systemPrompt}` },
    ...messages,
  ]

  const payload = {
    contents: toGeminiContents(geminiMessages),
    generationConfig: {
      temperature: 0.6,
    },
  }

  // #region agent log (debug)
  fetch('http://127.0.0.1:7372/ingest/88b29611-25a3-4160-afcc-5904d747e6c4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'82c074'},body:JSON.stringify({sessionId:'82c074',runId:'gemini-debug',hypothesisId:'H2_payload_shape',location:'aiChatService.js:requestGemini:preFetch',message:'Gemini request URL + payload shape',data:{urlBase:url.split('?')[0],usesV1Beta:url.includes('/v1beta/'),contentsCount:payload.contents?.length||0,firstRoles:(payload.contents||[]).slice(0,4).map(c=>c.role)},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    // #region agent log (debug)
    fetch('http://127.0.0.1:7372/ingest/88b29611-25a3-4160-afcc-5904d747e6c4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'82c074'},body:JSON.stringify({sessionId:'82c074',runId:'gemini-debug',hypothesisId:'H3_http_error',location:'aiChatService.js:requestGemini:nonOk',message:'Gemini returned non-OK',data:{status:response.status,errorSnippet:String(errorText||'').replace(/key=[^&\\s]+/gi,'key=[REDACTED]').slice(0,400)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    throw new Error(`AI API error: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('\n').trim()

  if (!text) {
    // #region agent log (debug)
    fetch('http://127.0.0.1:7372/ingest/88b29611-25a3-4160-afcc-5904d747e6c4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'82c074'},body:JSON.stringify({sessionId:'82c074',runId:'gemini-debug',hypothesisId:'H4_response_parsing',location:'aiChatService.js:requestGemini:noText',message:'Gemini OK but parsing returned empty',data:{hasCandidates:Boolean(data?.candidates),candidatesLength:(data?.candidates||[]).length,hasParts:Boolean(data?.candidates?.[0]?.content?.parts)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    throw new Error('No response content returned from Gemini API')
  }

  return text
}

async function requestOpenAICompatible({ apiKey, messages, role, language }) {
  const payload = {
    model: MODEL,
    temperature: 0.6,
    messages: [
      { role: 'system', content: buildSystemPrompt(role, language) },
      ...messages,
    ],
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`AI API error: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  const text = data?.choices?.[0]?.message?.content?.trim()

  if (!text) {
    throw new Error('No response content returned from AI API')
  }

  return text
}

export async function getAiChatReply({ messages, role = 'student', language = 'en' }) {
  const apiKey = import.meta.env.VITE_CHATBOT_API_KEY

  // #region agent log (debug)
  fetch('http://127.0.0.1:7372/ingest/88b29611-25a3-4160-afcc-5904d747e6c4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'82c074'},body:JSON.stringify({sessionId:'82c074',runId:'gemini-debug',hypothesisId:'H1_endpoint_or_model_mismatch',location:'aiChatService.js:getAiChatReply:precheck',message:'Gemini/OpenAI provider + config',data:{provider:PROVIDER,model:MODEL,apiUrlBase:(API_URL||'').split('?')[0],apiKeyPresent:Boolean(apiKey),messagesCount:Array.isArray(messages)?messages.length:0},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  if (!apiKey) {
    throw new Error('Missing VITE_CHATBOT_API_KEY in .env')
  }

  if (isGeminiEndpoint(API_URL)) {
    return requestGemini({ apiKey, messages, role, language })
  }

  return requestOpenAICompatible({ apiKey, messages, role, language })
}
