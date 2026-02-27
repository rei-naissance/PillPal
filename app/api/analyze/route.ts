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
    const { symptoms, type = 'diseases', disease } = await request.json()

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

    } else {
      const cacheKeyStr = `treatments-${disease}`
      const safeKey = cacheKeyStr.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase()

      const getCachedTreatments = unstable_cache(
        async () => fetchGroqData(type, undefined, disease),
        [safeKey],
        { tags: [safeKey] }
      )

      const result = await getCachedTreatments()
      return NextResponse.json({ treatments: result.treatments || { otc: [], prescription: [], home: [] } })
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