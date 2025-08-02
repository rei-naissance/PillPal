'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, X } from 'lucide-react'

const PREDEFINED_SYMPTOMS = [
  'Headache', 'Fever', 'Cough', 'Sore Throat', 'Nausea', 'Fatigue', 
  'Dizziness', 'Chest Pain', 'Shortness of Breath', 'Stomach Pain',
  'Muscle Aches', 'Runny Nose', 'Sneezing', 'Vomiting', 'Diarrhea',
  'Joint Pain', 'Back Pain', 'Rash', 'Itching', 'Swelling'
]

export default function HomePage() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [customSymptom, setCustomSymptom] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    )
  }

  const addCustomSymptom = () => {
    if (customSymptom.trim() && !selectedSymptoms.includes(customSymptom.trim())) {
      setSelectedSymptoms(prev => [...prev, customSymptom.trim()])
      setCustomSymptom('')
    }
  }

  const removeSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => prev.filter(s => s !== symptom))
  }

  const handleSubmit = async () => {
    if (selectedSymptoms.length === 0) return
    
    setIsLoading(true)
    
    // Store symptoms in sessionStorage for the results page
    sessionStorage.setItem('symptoms', JSON.stringify(selectedSymptoms))
    
    // Navigate to results page
    router.push('/results')
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-healthcare-dark mb-4">
          PillPal
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          AI-powered healthcare assistant to help you understand your symptoms and explore possible treatments
        </p>
      </div>

      {/* Symptom Input Section */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Enter your symptoms:
        </h2>

        {/* Selected Symptoms */}
        {selectedSymptoms.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Selected symptoms:</h3>
            <div className="flex flex-wrap gap-2">
              {selectedSymptoms.map((symptom) => (
                <div
                  key={symptom}
                  className="symptom-tag selected group"
                >
                  {symptom}
                  <button
                    onClick={() => removeSymptom(symptom)}
                    className="ml-2 opacity-70 hover:opacity-100"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Symptom Input */}
        <div className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={customSymptom}
              onChange={(e) => setCustomSymptom(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCustomSymptom()}
              placeholder="Type a custom symptom..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-healthcare-blue focus:border-transparent"
            />
            <button
              onClick={addCustomSymptom}
              disabled={!customSymptom.trim()}
              className="btn-secondary flex items-center gap-2"
            >
              <Plus size={16} />
              Add
            </button>
          </div>
        </div>

        {/* Predefined Symptoms */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Common symptoms:</h3>
          <div className="flex flex-wrap gap-2">
            {PREDEFINED_SYMPTOMS.map((symptom) => (
              <button
                key={symptom}
                onClick={() => toggleSymptom(symptom)}
                className={`symptom-tag ${
                  selectedSymptoms.includes(symptom) ? 'selected' : ''
                }`}
              >
                {symptom}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={selectedSymptoms.length === 0 || isLoading}
            className="btn-primary text-lg px-8 py-4 flex items-center gap-3 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Analyzing...
              </>
            ) : (
              <>
                <Search size={20} />
                Find Possible Conditions
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 text-center">
          <div className="text-3xl mb-3">🔍</div>
          <h3 className="font-semibold text-gray-900 mb-2">Symptom Analysis</h3>
          <p className="text-gray-600 text-sm">
            Advanced AI analyzes your symptoms to suggest possible conditions
          </p>
        </div>
        <div className="bg-white rounded-lg p-6 text-center">
          <div className="text-3xl mb-3">💊</div>
          <h3 className="font-semibold text-gray-900 mb-2">Treatment Options</h3>
          <p className="text-gray-600 text-sm">
            Get suggestions for OTC medications, prescriptions, and home remedies
          </p>
        </div>
        <div className="bg-white rounded-lg p-6 text-center">
          <div className="text-3xl mb-3">⚕️</div>
          <h3 className="font-semibold text-gray-900 mb-2">Professional Guidance</h3>
          <p className="text-gray-600 text-sm">
            Always consult healthcare professionals for proper diagnosis
          </p>
        </div>
      </div>
    </div>
  )
}
