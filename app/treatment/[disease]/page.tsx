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
      <main className="max-w-6xl mx-auto min-h-[60vh] flex flex-col items-center justify-center">
        <section className="text-center py-16">
          <Loader2 className="animate-spin h-12 w-12 text-zinc-900 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Finding treatment options...
          </h2>
          <p className="text-gray-600">
            Analyzing the best treatment approaches for {disease}
          </p>
        </section>
      </main>
    )
  }

  return (
    <main className="max-w-6xl mx-auto flex flex-col min-h-screen pb-24">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pt-4">
        <div className="flex items-center gap-6">
          <button
            onClick={handleBack}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all text-gray-700 flex-shrink-0"
            aria-label="Back to Results"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
              Treatment Options
            </h1>
            <p className="text-gray-500 mt-2 text-lg">
              For: <span className="font-semibold text-gray-800">{disease}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md text-gray-700 font-medium transition-all"
          >
            New Analysis
          </button>
          <button
            onClick={handleBack}
            className="px-6 py-3 rounded-2xl bg-zinc-900 hover:bg-black text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 font-medium transition-all"
          >
            Other Conditions
          </button>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <aside className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-8 flex items-start gap-4 shadow-sm" role="alert">
          <AlertCircle className="text-yellow-600 mt-0" size={24} />
          <div>
            <h3 className="font-medium text-yellow-800 text-lg">Notice</h3>
            <p className="text-yellow-700 mt-1">
              {error}. Showing example treatments for demonstration.
            </p>
          </div>
        </aside>
      )}

      {/* Treatment Sections */}
      <section className="grid lg:grid-cols-3 gap-8 mb-8">
        {/* Over-the-Counter Medications */}
        <article className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-3xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 ring-1 ring-black/5 hover:ring-green-500/20 group flex flex-col">
          <header className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 shadow-sm border border-green-100 group-hover:scale-110 group-hover:bg-green-100 transition-all duration-300">
              <Pill size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Over-the-Counter
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Available without prescription
              </p>
            </div>
          </header>

          <ul className="space-y-4 flex-1 overflow-y-auto pr-4 -mr-2 max-h-[400px]" style={{ scrollbarWidth: 'thin', scrollbarColor: '#E5E7EB transparent' }}>
            {treatments.otc.length > 0 ? (
              treatments.otc.map((medication, index) => (
                <li key={index} className="flex items-start gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-green-100/50 flex flex-shrink-0 items-center justify-center text-green-600 font-bold text-sm shadow-sm ring-1 ring-green-200">
                    {index + 1}
                  </div>
                  <span className="text-gray-700 leading-relaxed font-medium mt-1">{medication}</span>
                </li>
              ))
            ) : (
              <li className="text-gray-500 italic p-2">No OTC medications found</li>
            )}
          </ul>

          <aside className="mt-6 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-start gap-3">
            <span className="text-xl">💡</span>
            <p className="text-xs text-green-700 font-medium leading-relaxed pt-1">
              Always read labels and follow dosage instructions
            </p>
          </aside>
        </article>

        {/* Prescription Medications */}
        <article className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-3xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 ring-1 ring-black/5 hover:ring-blue-500/20 group flex flex-col">
          <header className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100 group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300">
              <Stethoscope size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Prescribed
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Requires doctor's prescription
              </p>
            </div>
          </header>

          <ul className="space-y-4 flex-1 overflow-y-auto pr-4 -mr-2 max-h-[400px]" style={{ scrollbarWidth: 'thin', scrollbarColor: '#E5E7EB transparent' }}>
            {treatments.prescription.length > 0 ? (
              treatments.prescription.map((medication, index) => (
                <li key={index} className="flex items-start gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-blue-100/50 flex flex-shrink-0 items-center justify-center text-blue-600 font-bold text-sm shadow-sm ring-1 ring-blue-200">
                    {index + 1}
                  </div>
                  <span className="text-gray-700 leading-relaxed font-medium mt-1">{medication}</span>
                </li>
              ))
            ) : (
              <li className="text-gray-500 italic p-2">No prescription medications found</li>
            )}
          </ul>

          <aside className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <p className="text-xs text-blue-700 font-medium leading-relaxed pt-1">
              Consult your doctor before taking any prescription medication
            </p>
          </aside>
        </article>

        {/* Home Remedies */}
        <article className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-3xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 ring-1 ring-black/5 hover:ring-orange-500/20 group flex flex-col">
          <header className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 shadow-sm border border-orange-100 group-hover:scale-110 group-hover:bg-orange-100 transition-all duration-300">
              <Home size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Home Remedies
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Natural and supportive care
              </p>
            </div>
          </header>

          <ul className="space-y-4 flex-1 overflow-y-auto pr-4 -mr-2 max-h-[400px]" style={{ scrollbarWidth: 'thin', scrollbarColor: '#E5E7EB transparent' }}>
            {treatments.home.length > 0 ? (
              treatments.home.map((remedy, index) => (
                <li key={index} className="flex items-start gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-orange-100/50 flex flex-shrink-0 items-center justify-center text-orange-600 font-bold text-sm shadow-sm ring-1 ring-orange-200">
                    {index + 1}
                  </div>
                  <span className="text-gray-700 leading-relaxed font-medium mt-1">{remedy}</span>
                </li>
              ))
            ) : (
              <li className="text-gray-500 italic p-2">No home remedies found</li>
            )}
          </ul>

          <aside className="mt-6 p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-start gap-3">
            <span className="text-xl">🏠</span>
            <p className="text-xs text-orange-700 font-medium leading-relaxed pt-1">
              Complement medical treatment, don't replace it
            </p>
          </aside>
        </article>
      </section>

      {/* Important Warnings */}
      <section className="grid md:grid-cols-2 gap-8 mb-8">
        <aside className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-2xl shadow-inner border border-red-200 flex-shrink-0">
              <AlertCircle size={28} />
            </div>
            <div>
              <h3 className="font-bold text-red-900 mb-4 text-lg">
                Seek Immediate Medical Attention If:
              </h3>
              <ul className="text-red-800 text-sm space-y-3 font-medium">
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-red-400"></span>
                  Symptoms worsen or persist
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-red-400"></span>
                  You experience severe pain
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-red-400"></span>
                  You have difficulty breathing
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-red-400"></span>
                  You develop a high fever
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-red-400"></span>
                  You have allergic reactions
                </li>
              </ul>
            </div>
          </div>
        </aside>

        <aside className="bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl shadow-inner border border-blue-200 flex-shrink-0">
              <Stethoscope size={28} />
            </div>
            <div>
              <h3 className="font-bold text-blue-900 mb-4 text-lg">
                Before Taking Any Medication:
              </h3>
              <ul className="text-blue-800 text-sm space-y-3 font-medium">
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  Consult with a healthcare provider
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  Check for drug interactions
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  Consider your medical history
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  Follow proper dosage guidelines
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  Monitor for side effects
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </section>
    </main>
  )
}
