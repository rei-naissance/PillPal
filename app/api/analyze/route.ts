import { NextRequest, NextResponse } from 'next/server'

const HUGGINGFACE_ROUTER_URL = 'https://router.huggingface.co/v1/chat/completions'

export async function POST(request: NextRequest) {
  try {
    const { symptoms, type = 'diseases', disease } = await request.json()

    if (!process.env.HUGGINGFACE_API_KEY) {
      return NextResponse.json(
        { error: 'HuggingFace API key not configured' },
        { status: 500 }
      )
    }

    let userPrompt = ''
    
    if (type === 'diseases') {
      userPrompt = `As a medical AI assistant, analyze these symptoms: ${symptoms.join(', ')}. 

List the most likely diseases or conditions that could cause these symptoms. Format your response as a simple list with each disease on a new line, starting with a dash (-). Provide only the disease names, no explanations. Example format:
- Disease Name 1
- Disease Name 2
- Disease Name 3`
    } else if (type === 'treatments') {
      userPrompt = `As a medical AI assistant, provide treatment options for "${disease}". 

Organize your response into exactly three sections with these headings:

Over-the-counter medications:
- [list OTC medications]

Prescription medications:
- [list prescription medications]

Home remedies:
- [list home remedies]

Use bullet points with dashes (-) for each item.`
    }

    const response = await fetch(HUGGINGFACE_ROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ],
        model: 'deepseek-ai/DeepSeek-R1:novita',
        max_tokens: 500,
        temperature: 0.7
      }),
    })

    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.choices && data.choices[0]?.message?.content) {
      const text = data.choices[0].message.content.trim()
      
      if (type === 'diseases') {
        // Parse diseases from bullet points
        const diseases = text
          .split('\n')
          .map((line: string) => line.trim())
          .filter((line: string) => line.startsWith('-') || line.startsWith('•'))
          .map((line: string) => line.replace(/^[-•]\s*/, '').trim())
          .filter((disease: string) => disease.length > 0)
          .slice(0, 10) // Limit to 10 diseases
        
        return NextResponse.json({ diseases })
      } else {
        // Parse treatments into categories
        const sections = text.split(/(?=Over-the-counter|Prescription|Home)/i)
        
        const treatments: {
          otc: string[]
          prescription: string[]
          home: string[]
        } = {
          otc: [],
          prescription: [],
          home: []
        }
        
        sections.forEach((section: string) => {
          const lines = section.split('\n').map((line: string) => line.trim()).filter((line: string) => line)
          
          if (section.toLowerCase().includes('over-the-counter')) {
            treatments.otc = lines
              .filter((line: string) => line.startsWith('-') || line.startsWith('•'))
              .map((line: string) => line.replace(/^[-•]\s*/, '').trim())
              .slice(0, 8)
          } else if (section.toLowerCase().includes('prescription')) {
            treatments.prescription = lines
              .filter((line: string) => line.startsWith('-') || line.startsWith('•'))
              .map((line: string) => line.replace(/^[-•]\s*/, '').trim())
              .slice(0, 8)
          } else if (section.toLowerCase().includes('home')) {
            treatments.home = lines
              .filter((line: string) => line.startsWith('-') || line.startsWith('•'))
              .map((line: string) => line.replace(/^[-•]\s*/, '').trim())
              .slice(0, 8)
          }
        })
        
        return NextResponse.json({ treatments })
      }
    }
    
    return NextResponse.json(
      { error: 'Invalid response from AI model' },
      { status: 500 }
    )
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze symptoms' },
      { status: 500 }
    )
  }
}
