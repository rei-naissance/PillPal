'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  X,
  Activity,
  History,
  Sparkles,
  ArrowRight,
  Command,
  TrendingUp,
  ThermometerSun,
  Pill
} from 'lucide-react'

// Mock Data for "Trending" or "Categories"
const TRENDING_SYMPTOMS = [
  { id: 't1', text: 'Viral Fever', icon: ThermometerSun, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 't2', text: 'Seasonal Flu', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 't3', text: 'Migraine', icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-50' },
]

const RECENT_SEARCHES = [
  'Headache', 'Nausea'
]

const ALL_SYMPTOMS = [
  'Headache', 'Fever', 'Cough', 'Sore Throat', 'Nausea', 'Fatigue',
  'Dizziness', 'Chest Pain', 'Shortness of Breath', 'Stomach Pain',
  'Muscle Aches', 'Runny Nose', 'Sneezing', 'Vomiting', 'Diarrhea',
  'Joint Pain', 'Back Pain', 'Rash', 'Itching', 'Swelling'
]

export default function HomePage() {
  const [query, setQuery] = useState('')
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Filter symptoms based on query
  const filteredSymptoms = ALL_SYMPTOMS.filter(s =>
    s.toLowerCase().includes(query.toLowerCase()) && !selectedSymptoms.includes(s)
  ).slice(0, 5)

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    )
    setQuery('')
    inputRef.current?.focus()
  }

  const removeSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => prev.filter(s => s !== symptom))
  }

  const handleSubmit = async () => {
    if (selectedSymptoms.length === 0) return

    // Store symptoms in sessionStorage for the results page
    sessionStorage.setItem('symptoms', JSON.stringify(selectedSymptoms))
    sessionStorage.removeItem('diseaseResults')
    router.push('/results')
  }

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center relative">

      {/* Main Content Container */}
      <div className="w-full max-w-2xl px-6 relative z-10 transition-all duration-500 ease-out">

        {/* Header / Logo Area */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-900 text-white mb-4 shadow-xl">
            <Pill className="w-6 h-6" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
            What's troubling you?
          </h1>
          <p className="text-lg text-gray-500 font-medium">
            Describe your symptoms to find clarity.
          </p>
        </div>

        {/* Search Container */}
        <div
          className={`
            group relative bg-white rounded-3xl transition-all duration-300 ease-out
            ${isFocused || query ? 'shadow-2xl ring-2 ring-zinc-900/10 scale-[1.02]' : 'shadow-xl hover:shadow-2xl ring-1 ring-black/5'}
          `}
        >
          {/* Input Area */}
          <div className="relative flex items-center p-2">
            <div className="pl-4 pr-3 text-gray-400">
              <Search className={`w-6 h-6 transition-colors ${isFocused ? 'text-zinc-900' : ''}`} />
            </div>

            <div className="flex-1 flex flex-wrap items-center gap-2 min-h-[3.5rem] py-1">
              {selectedSymptoms.map(s => (
                <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-800 text-sm font-medium animate-in fade-in zoom-in-95 duration-200">
                  {s}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeSymptom(s); }}
                    className="p-0.5 hover:bg-zinc-200 rounded-md transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && query) {
                    toggleSymptom(query)
                  } else if (e.key === 'Backspace' && !query && selectedSymptoms.length > 0) {
                    removeSymptom(selectedSymptoms[selectedSymptoms.length - 1])
                  } else if (e.key === 'Enter' && !query && selectedSymptoms.length > 0) {
                    handleSubmit()
                  }
                }}
                placeholder={selectedSymptoms.length === 0 ? "Type a symptom like 'Headache'..." : "Add another..."}
                className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-lg text-gray-900 placeholder:text-gray-400 h-full"
                autoComplete="off"
              />
            </div>

            {selectedSymptoms.length > 0 && (
              <button
                onClick={handleSubmit}
                className="ml-2 p-3 bg-zinc-900 hover:bg-black text-white rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Autocomplete / Suggestions Dropdown */}
          <div
            className={`
              overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]
              ${(isFocused || query) ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}
            `}
          >
            <div className="px-2 pb-2">
              <div className="h-px bg-gray-100 mx-2 mb-2" />

              {query ? (
                // Search Results
                <div className="p-1 max-h-[300px] overflow-y-auto">
                  <div className="text-xs font-semibold text-gray-400 px-3 py-2 uppercase tracking-wider">
                    Suggestions
                  </div>
                  {filteredSymptoms.length > 0 ? filteredSymptoms.map(s => (
                    <button
                      key={s}
                      onClick={() => toggleSymptom(s)}
                      className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-gray-50 text-left transition-colors group"
                    >
                      <span className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                          <PlusIcon />
                        </div>
                        <span className="font-medium text-gray-700 group-hover:text-gray-900">{s}</span>
                      </span>
                      <span className="text-gray-300 group-hover:text-zinc-400">
                        <Command className="w-3.5 h-3.5" />
                      </span>
                    </button>
                  )) : (
                    <button
                      onClick={() => toggleSymptom(query)}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 text-left transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                        <PlusIcon />
                      </div>
                      <span className="font-medium text-gray-700">Add "{query}"</span>
                    </button>
                  )}
                </div>
              ) : (
                // Default State (History & Trending)
                <div className="p-1">
                  {/* Recent Searches (Mocked) */}
                  <div className="mb-2">
                    <div className="text-xs font-semibold text-gray-400 px-3 py-2 uppercase tracking-wider">
                      Recent
                    </div>
                    {RECENT_SEARCHES.map(s => (
                      !selectedSymptoms.includes(s) && (
                        <button
                          key={s}
                          onClick={() => toggleSymptom(s)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-left transition-colors group"
                        >
                          <History className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                          <span className="font-medium text-gray-600 group-hover:text-gray-900">{s}</span>
                        </button>
                      )
                    ))}
                  </div>

                  {/* Common Symptoms Grid */}
                  <div className="mb-2">
                    <div className="text-xs font-semibold text-gray-400 px-3 py-2 uppercase tracking-wider">
                      Common Symptoms
                    </div>
                    <div className="flex flex-wrap gap-2 px-3 py-1">
                      {ALL_SYMPTOMS.slice(0, 12).map(s => (
                        !selectedSymptoms.includes(s) && (
                          <button
                            key={s}
                            onClick={() => toggleSymptom(s)}
                            className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-50 text-gray-600 hover:bg-zinc-900 hover:text-white transition-all duration-200"
                          >
                            {s}
                          </button>
                        )
                      ))}
                    </div>
                  </div>

                  {/* Trending/Categories */}
                  <div>
                    <div className="text-xs font-semibold text-gray-400 px-3 py-2 uppercase tracking-wider">
                      Trending Now
                    </div>
                    {TRENDING_SYMPTOMS.map(item => (
                      <button
                        key={item.id}
                        onClick={() => toggleSymptom(item.text)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 text-left transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${item.color.replace('text', 'bg')}`} />
                          <span className="font-medium text-gray-700">{item.text}</span>
                        </div>
                        <TrendingUp className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
            <Command className="w-3 h-3" />
            <span>Press <kbd className="font-sans font-semibold text-gray-500">Enter</kbd> to search</span>
          </p>
        </div>

      </div>
    </div>
  )
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  )
}
