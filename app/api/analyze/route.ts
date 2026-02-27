import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

const fetchGroqData = async (type: string, symptoms?: string[], disease?: string) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('Groq API key not configured')
  }

  let systemPrompt = ''
  let userPrompt = ''

  if (type === 'diseases') {
    systemPrompt = `You are a concise medical AI diagnostician. Analyze the symptoms provided and return a list of the most likely diseases. 
    You MUST respond with a valid JSON object matching exactly this schema:
    { "diseases": ["Disease 1", "Disease 2", "Disease 3"] }
    Do not output any markdown formatting, explanations, or conversational text outside the JSON object.`
    userPrompt = `Symptoms: ${(symptoms || []).join(', ')}`
  } else if (type === 'treatments') {
    systemPrompt = `You are an expert medical AI. Provide treatment options for the specified disease. 
    You MUST respond with a valid JSON object matching exactly this schema:
    { "treatments": { "otc": ["med1"], "prescription": ["med1"], "home": ["remedy1"] } }
    Do not output any markdown formatting, explanations, or conversational text outside the JSON object.`
    userPrompt = `Disease: ${disease}`
  } else if (type === 'trending') {
    systemPrompt = `You are a medical AI. Suggest 3 trending or seasonal health symptoms people might be experiencing right now based on the current season or general common ailments.
    You MUST respond with a valid JSON object matching exactly this schema:
    { "trending": ["symptom 1", "symptom 2", "symptom 3"] }
    Do not output any markdown formatting, explanations, or conversational text outside the JSON object.`
    userPrompt = `What are 3 trending symptoms right now?`
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama-3.3-70b-versatile', // Free model available on Groq
      max_tokens: 1024,
      temperature: 0.7,
      response_format: { type: "json_object" }
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new Error(`Groq API error: ${response.status} - ${errorData?.error?.message || 'Unknown error'}`)
  }

  const data = await response.json()
  const text = data.choices[0]?.message?.content?.trim()

  if (!text) {
    throw new Error('Invalid response from AI model')
  }

  try {
    return JSON.parse(text)
  } catch (e) {
    // Fallback: extract JSON from markdown if the model hallucinated code blocks anyway
    const match = text.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('Failed to parse unstructured AI response')
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { symptoms, type = 'diseases', disease } = body

    // 1. Enterprise Security: Validate and sanitize payload limits to prevent token-draining / DDOS
    if (type === 'diseases') {
      if (symptoms && (!Array.isArray(symptoms) || symptoms.length > 25 || symptoms.join('').length > 500)) {
        return NextResponse.json({ error: 'Symptoms payload too large or invalid structure.' }, { status: 400 })
      }
    } else if (type === 'treatments') {
      if (typeof disease !== 'string' || disease.length > 100 || disease.trim().length === 0) {
        return NextResponse.json({ error: 'Disease parameter must be a valid, constrained string.' }, { status: 400 })
      }
    } else if (type !== 'trending') {
      return NextResponse.json({ error: 'Invalid analysis type requested.' }, { status: 400 })
    }

    // 2. Auth Verification: Validate environment configuration
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API key not configured' },
        { status: 500 }
      )
    }

    if (type === 'diseases') {
      const cacheKeyStr = `diseases-${[...(symptoms || [])].sort().join('-')}`
      // Remove spaces or special chars for valid cache tags
      const safeKey = cacheKeyStr.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase()

      const getCachedDiseases = unstable_cache(
        async () => fetchGroqData(type, symptoms),
        [safeKey],
        { tags: [safeKey] }
      )

      const result = await getCachedDiseases()
      return NextResponse.json({ diseases: result.diseases || [] })

    } else if (type === 'treatments') {
      const cacheKeyStr = `treatments-${disease}`
      const safeKey = cacheKeyStr.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase()

      const getCachedTreatments = unstable_cache(
        async () => fetchGroqData(type, undefined, disease),
        [safeKey],
        { tags: [safeKey] }
      )

      const result = await getCachedTreatments()
      return NextResponse.json({ treatments: result.treatments || { otc: [], prescription: [], home: [] } })
    } else if (type === 'trending') {
      const safeKey = 'trending-symptoms-daily'

      const getCachedTrending = unstable_cache(
        async () => fetchGroqData(type),
        [safeKey],
        { tags: [safeKey], revalidate: 86400 } // Revalidate cache every 24 hours
      )

      const result = await getCachedTrending()
      return NextResponse.json({ trending: result.trending || ['Fever', 'Cough', 'Headache'] })
    }

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to analyze request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}