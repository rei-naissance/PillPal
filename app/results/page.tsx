'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react'

export default function ResultsPage() {
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [diseases, setDiseases] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const storedSymptoms = sessionStorage.getItem('symptoms')
    if (!storedSymptoms) {
      router.push('/')
      return
    }

    const symptomsArray = JSON.parse(storedSymptoms)
    setSymptoms(symptomsArray)
    analyzeSymptons(symptomsArray)
  }, [router])

  const analyzeSymptons = async (symptoms: string[]) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symptoms,
          type: 'diseases'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze symptoms')
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      setDiseases(data.diseases || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      // Fallback diseases for demo purposes
      setDiseases([
        'Common Cold',
        'Influenza (Flu)',
        'Migraine',
        'Tension Headache',
        'Gastroenteritis',
        'Sinusitis'
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDiseaseClick = (disease: string) => {
    sessionStorage.setItem('selectedDisease', disease)
    router.push(`/treatment/${encodeURIComponent(disease)}`)
  }

  const handleBack = () => {
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-16">
          <Loader2 className="animate-spin h-12 w-12 text-healthcare-blue mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Analyzing your symptoms...
          </h2>
          <p className="text-gray-600">
            Our AI is processing your symptoms to find possible conditions
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={handleBack}
          className="btn-secondary flex items-center gap-2 mr-4"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div>
          <h1 className="text-3xl font-bold text-healthcare-dark">
            Possible Conditions
          </h1>
          <p className="text-gray-600 mt-1">
            Based on your symptoms: {symptoms.join(', ')}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
          <div>
            <h3 className="font-medium text-yellow-800">Notice</h3>
            <p className="text-yellow-700 text-sm mt-1">
              {error}. Showing example results for demonstration.
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        {diseases.length > 0 ? (
          <>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Possible Diseases:
            </h2>
            <div className="grid gap-4">
              {diseases.map((disease, index) => (
                <button
                  key={index}
                  onClick={() => handleDiseaseClick(disease)}
                  className="disease-card text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {disease}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        Click to view treatment options
                      </p>
                    </div>
                    <div className="text-healthcare-blue">
                      →
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No conditions found
            </h3>
            <p className="text-gray-600">
              Please try again with different symptoms or consult a healthcare professional.
            </p>
          </div>
        )}
      </div>

      {/* Important Notice */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mt-8">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-red-600 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-red-800 mb-2">
              Important Medical Notice
            </h3>
            <p className="text-red-700 text-sm">
              These suggestions are for informational purposes only. If you're experiencing severe symptoms, 
              persistent symptoms, or symptoms that worsen, please seek immediate medical attention from a 
              qualified healthcare professional.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
