'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, AlertCircle, Loader2 } from 'lucide-react'

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

    // Check if we already have cached results
    const cachedResults = sessionStorage.getItem('diseaseResults')
    if (cachedResults) {
      // Use cached results instead of calling API again
      const cachedDiseases = JSON.parse(cachedResults)
      setDiseases(cachedDiseases)
      setIsLoading(false)
    } else {
      // Only call API if no cached results exist
      analyzeSymptons(symptomsArray)
    }
  }, [router])

  const preloadTreatmentData = async (diseases: string[]) => {
    // Preload treatment data for all diseases in the background
    const treatmentPromises = diseases.map(async (disease) => {
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            disease,
            type: 'treatments'
          }),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.treatments) {
            // Cache treatment data for this disease
            sessionStorage.setItem(`treatments_${disease}`, JSON.stringify(data.treatments))
          }
        }
      } catch (error) {
        // Silently fail for preloading - user can still get data when they click
        console.log(`Failed to preload treatments for ${disease}:`, error)
      }
    })

    // Execute all preload requests in parallel (don't await - run in background)
    Promise.allSettled(treatmentPromises)
  }

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

      const diseases = data.diseases || []
      setDiseases(diseases)
      // Cache the results for future navigation
      sessionStorage.setItem('diseaseResults', JSON.stringify(diseases))

      // Preload treatment data for all diseases
      preloadTreatmentData(diseases)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      // Fallback diseases for demo purposes
      const fallbackDiseases = [
        'Common Cold',
        'Influenza (Flu)',
        'Migraine',
        'Tension Headache',
        'Gastroenteritis',
        'Sinusitis'
      ]
      setDiseases(fallbackDiseases)
      // Cache the fallback results too
      sessionStorage.setItem('diseaseResults', JSON.stringify(fallbackDiseases))

      // Preload treatment data for fallback diseases too
      preloadTreatmentData(fallbackDiseases)
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
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100/50 p-6 md:p-8 flex flex-col mb-8" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        {diseases.length > 0 ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex-shrink-0 flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-sm shadow-sm">✓</span>
              Possible Matches
            </h2>
            <div className="flex-1 overflow-y-auto pr-3 -mr-3 pb-2 space-y-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#E5E7EB transparent' }}>
              {diseases.map((disease, index) => (
                <button
                  key={index}
                  onClick={() => handleDiseaseClick(disease)}
                  className="w-full group relative flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-orange-200 transition-all duration-300 text-left overflow-hidden ring-1 ring-black/5 hover:ring-orange-500/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-50/0 via-orange-50/0 to-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100/80 flex items-center justify-center text-gray-400 group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors shadow-inner border border-gray-100">
                      <span className="font-bold text-lg">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg group-hover:text-orange-600 transition-colors">
                        {disease}
                      </h3>
                      <p className="text-gray-500 text-sm mt-0.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm" />
                        Click to view treatment plan
                      </p>
                    </div>
                  </div>

                  <div className="relative z-10 w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-sm group-hover:shadow-md group-hover:scale-110 border border-gray-100 group-hover:border-orange-500">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 flex-shrink-0">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-1 ring-gray-100">
              <AlertCircle className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              No conditions found
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Please try again with different symptoms or consult a healthcare professional for an accurate diagnosis.
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
