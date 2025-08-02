'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, AlertCircle, Loader2, Pill, Stethoscope, Home } from 'lucide-react'

interface Treatments {
  otc: string[]
  prescription: string[]
  home: string[]
}

export default function TreatmentPage() {
  const [disease, setDisease] = useState<string>('')
  const [treatments, setTreatments] = useState<Treatments>({
    otc: [],
    prescription: [],
    home: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    const diseaseParam = Array.isArray(params.disease) ? params.disease[0] : params.disease
    if (!diseaseParam) {
      router.push('/')
      return
    }

    const decodedDisease = decodeURIComponent(diseaseParam)
    setDisease(decodedDisease)
    
    // Check if we have cached treatment data first
    const cachedTreatments = sessionStorage.getItem(`treatments_${decodedDisease}`)
    if (cachedTreatments) {
      // Use cached data for instant loading
      const treatmentData = JSON.parse(cachedTreatments)
      setTreatments(treatmentData)
      setIsLoading(false)
    } else {
      // Fetch from API if no cached data
      fetchTreatments(decodedDisease)
    }
  }, [params.disease, router])

  const fetchTreatments = async (diseaseName: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          disease: diseaseName,
          type: 'treatments'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch treatments')
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      const treatmentData = data.treatments || {
        otc: [],
        prescription: [],
        home: []
      }
      setTreatments(treatmentData)
      // Cache the treatment data for future instant access
      sessionStorage.setItem(`treatments_${diseaseName}`, JSON.stringify(treatmentData))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      // Fallback treatments for demo purposes
      const fallbackTreatments = {
        otc: [
          'Ibuprofen (Advil, Motrin)',
          'Acetaminophen (Tylenol)',
          'Aspirin',
          'Antihistamines (Benadryl)',
          'Decongestants (Sudafed)',
          'Cough drops',
          'Throat lozenges'
        ],
        prescription: [
          'Antibiotics (if bacterial infection)',
          'Antiviral medications',
          'Prescription pain relievers',
          'Corticosteroids',
          'Prescription antihistamines',
          'Bronchodilators'
        ],
        home: [
          'Rest and adequate sleep',
          'Drink plenty of fluids',
          'Use a humidifier',
          'Gargle with warm salt water',
          'Apply warm or cold compresses',
          'Eat nutritious foods',
          'Avoid smoking and alcohol'
        ]
      }
      setTreatments(fallbackTreatments)
      // Cache the fallback treatments too
      sessionStorage.setItem(`treatments_${diseaseName}`, JSON.stringify(fallbackTreatments))
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    router.push('/results')
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-16">
          <Loader2 className="animate-spin h-12 w-12 text-healthcare-blue mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Finding treatment options...
          </h2>
          <p className="text-gray-600">
            Analyzing the best treatment approaches for {disease}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={handleBack}
          className="btn-secondary flex items-center gap-2 mr-4"
        >
          <ArrowLeft size={16} />
          Back to Results
        </button>
        <div>
          <h1 className="text-3xl font-bold text-healthcare-dark">
            Treatment Options
          </h1>
          <p className="text-gray-600 mt-1">
            For: <span className="font-medium">{disease}</span>
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
              {error}. Showing example treatments for demonstration.
            </p>
          </div>
        </div>
      )}

      {/* Treatment Sections */}
      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        {/* Over-the-Counter Medications */}
        <div className="treatment-section">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Pill className="text-green-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Over-the-Counter Medications
              </h2>
              <p className="text-sm text-gray-600">
                Available without prescription
              </p>
            </div>
          </div>
          
          {treatments.otc.length > 0 ? (
            <ul className="space-y-3">
              {treatments.otc.map((medication, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">{medication}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No OTC medications found</p>
          )}
          
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-xs text-green-700">
              💡 Always read labels and follow dosage instructions
            </p>
          </div>
        </div>

        {/* Prescription Medications */}
        <div className="treatment-section">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Stethoscope className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Prescribed Medications
              </h2>
              <p className="text-sm text-gray-600">
                Requires doctor's prescription
              </p>
            </div>
          </div>
          
          {treatments.prescription.length > 0 ? (
            <ul className="space-y-3">
              {treatments.prescription.map((medication, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">{medication}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No prescription medications found</p>
          )}
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              ⚠️ Consult your doctor before taking any prescription medication
            </p>
          </div>
        </div>

        {/* Home Remedies */}
        <div className="treatment-section">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Home className="text-orange-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Home Remedies
              </h2>
              <p className="text-sm text-gray-600">
                Natural and supportive care
              </p>
            </div>
          </div>
          
          {treatments.home.length > 0 ? (
            <ul className="space-y-3">
              {treatments.home.map((remedy, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">{remedy}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No home remedies found</p>
          )}
          
          <div className="mt-4 p-3 bg-orange-50 rounded-lg">
            <p className="text-xs text-orange-700">
              🏠 Complement medical treatment, don't replace it
            </p>
          </div>
        </div>
      </div>

      {/* Important Warnings */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-600 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-red-800 mb-2">
                Seek Immediate Medical Attention If:
              </h3>
              <ul className="text-red-700 text-sm space-y-1">
                <li>• Symptoms worsen or persist</li>
                <li>• You experience severe pain</li>
                <li>• You have difficulty breathing</li>
                <li>• You develop a high fever</li>
                <li>• You have allergic reactions</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Stethoscope className="text-blue-600 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">
                Before Taking Any Medication:
              </h3>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Consult with a healthcare provider</li>
                <li>• Check for drug interactions</li>
                <li>• Consider your medical history</li>
                <li>• Follow proper dosage guidelines</li>
                <li>• Monitor for side effects</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={() => router.push('/')}
          className="btn-secondary"
        >
          Start New Analysis
        </button>
        <button
          onClick={handleBack}
          className="btn-primary"
        >
          View Other Conditions
        </button>
      </div>
    </div>
  )
}
