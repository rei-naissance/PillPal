import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const CACHE_TTL = 60 * 60 * 1000 // 1 hour cache
const RATE_LIMIT = 5 // Max requests per minute

// Simple in-memory cache (consider Redis for production)
const cache = new Map<string, { data: any; timestamp: number }>()
const requestCounts = new Map<string, number>()

export async function POST(request: NextRequest) {
  // Use x-forwarded-for header for client IP, fallback to 'unknown' if not present
  const clientIp = request.headers.get('x-forwarded-for') || 'unknown'

  // Rate limiting
  const now = Date.now()
  const windowStart = now - 60 * 1000
  const clientRequests = (requestCounts.get(clientIp) || 0) + 1
  
  if (clientRequests > RATE_LIMIT) {
    return NextResponse.json(
      { error: 'Too many requests', suggestion: 'Please wait a minute before trying again' },
      { status: 429 }
    )
  }
  requestCounts.set(clientIp, clientRequests)

  try {
    const { symptoms, type = 'diseases', disease } = await request.json()

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API key not configured' },
        { status: 500 }
      )
    }

    // Create cache key
    const cacheKey = JSON.stringify({ symptoms, type, disease })

    // Check cache
    const cached = cache.get(cacheKey)
    if (cached && now - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data)
    }

    const userPrompt = type === 'diseases'
      ? createDiseasePrompt(symptoms)
      : createTreatmentPrompt(disease)

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: userPrompt }],
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1024,
        temperature: 0.7,
        response_format: { type: 'json_object' } // Request structured JSON output
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(`Groq API error: ${response.status} - ${errorData?.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    
    if (data.choices?.[0]?.message?.content) {
      const result = type === 'diseases'
        ? parseDiseaseResponse(data.choices[0].message.content)
        : parseTreatmentResponse(data.choices[0].message.content)

      // Cache the result
      cache.set(cacheKey, { data: result, timestamp: now })

      return NextResponse.json(result)
    }
    
    return NextResponse.json(
      { error: 'Invalid response from AI model' },
      { status: 500 }
    )
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to analyze symptoms',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Helper functions
function createDiseasePrompt(symptoms: string[]): string {
  return `As a medical AI assistant, analyze these symptoms: ${symptoms.join(', ')}. 
    Return a JSON object with a "diseases" array containing the 10 most likely conditions.
    Example: {"diseases": ["Condition 1", "Condition 2"]}`
}

function createTreatmentPrompt(disease: string): string {
  return `As a medical AI assistant, provide treatment options for "${disease}".
    Return a JSON object with three arrays: "otc", "prescription", and "home".
    Example: {
      "otc": ["Med 1", "Med 2"],
      "prescription": ["Rx 1", "Rx 2"],
      "home": ["Remedy 1", "Remedy 2"]
    }`
}

function parseDiseaseResponse(text: string): { diseases: string[] } {
  try {
    // Try to parse as JSON first
    const json = JSON.parse(text)
    if (json?.diseases) {
      return { diseases: json.diseases.slice(0, 10) }
    }
  } catch {}

  // Fallback to text parsing
  const diseases = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('-') || line.startsWith('•'))
    .map(line => line.replace(/^[-•]\s*/, '').trim())
    .filter(disease => disease.length > 0)
    .slice(0, 10)
  
  return { diseases }
}

function parseTreatmentResponse(text: string): { 
  otc: string[]
  prescription: string[]
  home: string[]
} {
  try {
    // Try to parse as JSON first
    const json = JSON.parse(text)
    if (json && (json.otc || json.prescription || json.home)) {
      return {
        otc: json.otc?.slice(0, 8) || [],
        prescription: json.prescription?.slice(0, 8) || [],
        home: json.home?.slice(0, 8) || []
      }
    }
  } catch {}

  // Fallback to text parsing
  const result = {
    otc: [] as string[],
    prescription: [] as string[],
    home: [] as string[]
  }

  const sections = text.split(/(?=Over-the-counter|Prescription|Home)/i)
  sections.forEach(section => {
    const lines = section.split('\n').map(line => line.trim()).filter(line => line)
    const items = lines
      .filter(line => line.startsWith('-') || line.startsWith('•'))
      .map(line => line.replace(/^[-•]\s*/, '').trim())
      .slice(0, 8)

    if (section.toLowerCase().includes('over-the-counter')) {
      result.otc = items
    } else if (section.toLowerCase().includes('prescription')) {
      result.prescription = items
    } else if (section.toLowerCase().includes('home')) {
      result.home = items
    }
  })

  return result
}