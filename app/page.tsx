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

const FALLBACK_TRENDING = ['Viral Fever', 'Seasonal Flu', 'Migraine']

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
  const [trendingSymptoms, setTrendingSymptoms] = useState<string[]>(FALLBACK_TRENDING)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  useEffect(() => {
    try {
      const cached = localStorage.getItem('trending-symptoms-cache')
      const time = localStorage.getItem('trending-symptoms-time')
      const isExpired = time ? (Date.now() - parseInt(time)) > 12 * 60 * 60 * 1000 : true

      if (cached && !isExpired) {
        setTrendingSymptoms(JSON.parse(cached))
        return
      }

      fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'trending' })
      })
        .then(res => res.json())
        .then(data => {
          if (data.trending && Array.isArray(data.trending)) {
            setTrendingSymptoms(data.trending)
            localStorage.setItem('trending-symptoms-cache', JSON.stringify(data.trending))
            localStorage.setItem('trending-symptoms-time', Date.now().toString())
          }
        })
        .catch((e) => console.log('Silently failed trending fetch:', e))
    } catch {
      // Ignore local storage errors
    }
  }, [])

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
    inputRef.current?.focus()
  }

  const handleSubmit = async () => {
    if (selectedSymptoms.length === 0) return

    // Store symptoms in localStorage for the results page persistent memory
    localStorage.setItem('symptoms', JSON.stringify(selectedSymptoms))
    router.push('/results')
  }

  return (
    <main className="min-h-[85vh] flex flex-col items-center justify-center relative">

      {/* Main Content Container */}
      <section className="w-full max-w-2xl px-6 relative z-10 transition-all duration-500 ease-out">

        {/* Header / Logo Area */}
        <header className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-900 text-white mb-4 shadow-xl">
            <Pill className="w-6 h-6" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
            What's troubling you?
          </h1>
          <p className="text-lg text-gray-500 font-medium">
            Describe your symptoms to find clarity.
          </p>
        </header>

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

            <div className="flex-1 flex flex-wrap items-center gap-2 min-h-[3.5rem] py-2">
              {selectedSymptoms.map(s => (
                <span key={s} className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-zinc-100 text-zinc-800 text-sm font-medium animate-in fade-in zoom-in-95 duration-200">
                  {s}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeSymptom(s); }}
                    className="p-1 hover:bg-zinc-200 rounded-md transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                  if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current)
                  setIsFocused(true)
                }}
                onBlur={() => {
                  focusTimeoutRef.current = setTimeout(() => setIsFocused(false), 200)
                }}
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
                className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-lg text-gray-900 placeholder:text-gray-400 h-full py-1"
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
          <section
            className={`
              overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]
              ${(isFocused || query) ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}
            `}
            onMouseDown={(e) => e.preventDefault()}
          >
            <div className="px-2 pb-2">
              <div className="h-px bg-gray-100 mx-2 mb-2" />

              {query ? (
                // Search Results
                <nav className="p-2 max-h-[300px] overflow-y-auto" aria-label="Search suggestions">
                  <div className="text-xs font-semibold text-gray-400 px-4 py-2 uppercase tracking-wider mb-2">
                    Suggestions
                  </div>
                  <ul className="space-y-2">
                    {filteredSymptoms.length > 0 ? filteredSymptoms.map(s => (
                      <li key={s}>
                        <button
                          onClick={() => toggleSymptom(s)}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 text-left transition-colors group"
                        >
                          <span className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                              <PlusIcon />
                            </div>
                            <span className="font-medium text-gray-700 group-hover:text-gray-900">{s}</span>
                          </span>
                          <span className="text-gray-300 group-hover:text-zinc-400">
                            <Command className="w-4 h-4" />
                          </span>
                        </button>
                      </li>
                    )) : (
                      <li>
                        <button
                          onClick={() => toggleSymptom(query)}
                          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-gray-50 text-left transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                            <PlusIcon />
                          </div>
                          <span className="font-medium text-gray-700">Add "{query}"</span>
                        </button>
                      </li>
                    )}
                  </ul>
                </nav>
              ) : (
                // Default State (History & Trending)
                <div className="p-2">
                  {/* Recent Searches (Mocked) */}
                  <nav className="mb-4" aria-label="Recent searches">
                    <div className="text-xs font-semibold text-gray-400 px-4 py-2 uppercase tracking-wider mb-2">
                      Recent
                    </div>
                    <ul className="space-y-2">
                      {RECENT_SEARCHES.map(s => (
                        !selectedSymptoms.includes(s) && (
                          <li key={s}>
                            <button
                              onClick={() => toggleSymptom(s)}
                              className="w-full flex items-center gap-4 px-4 py-2 rounded-xl hover:bg-gray-50 text-left transition-colors group"
                            >
                              <History className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                              <span className="font-medium text-gray-600 group-hover:text-gray-900">{s}</span>
                            </button>
                          </li>
                        )
                      ))}
                    </ul>
                  </nav>

                  {/* Common Symptoms Grid */}
                  <nav className="mb-4" aria-label="Common symptoms">
                    <div className="text-xs font-semibold text-gray-400 px-4 py-2 uppercase tracking-wider mb-2">
                      Common Symptoms
                    </div>
                    <ul className="flex flex-wrap gap-2 px-4 py-2">
                      {ALL_SYMPTOMS.slice(0, 12).map(s => (
                        !selectedSymptoms.includes(s) && (
                          <li key={s}>
                            <button
                              onClick={() => toggleSymptom(s)}
                              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-gray-50 text-gray-600 hover:bg-zinc-900 hover:text-white transition-all duration-200"
                            >
                              {s}
                            </button>
                          </li>
                        )
                      ))}
                    </ul>
                  </nav>

                  {/* Trending/Categories */}
                  <nav aria-label="Trending symptoms">
                    <div className="text-xs font-semibold text-gray-400 px-4 py-2 uppercase tracking-wider mb-2">
                      Trending Now
                    </div>
                    <ul className="space-y-2">
                      {trendingSymptoms.map((text, i) => {
                        const colors = ['bg-orange-500', 'bg-blue-500', 'bg-emerald-500']
                        return (
                          <li key={`t${i}`}>
                            <button
                              onClick={() => toggleSymptom(text)}
                              className="w-full flex items-center justify-between px-4 py-2 rounded-xl hover:bg-gray-50 text-left transition-colors group"
                            >
                              <div className="flex items-center gap-4">
                                <div className={`w-2 h-2 rounded-full ${colors[i % colors.length]}`} />
                                <span className="font-medium text-gray-700">{text}</span>
                              </div>
                              <TrendingUp className="w-4 h-4 text-gray-300 group-hover:text-gray-500" />
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </nav>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Footer Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
            <Command className="w-3 h-3" />
            <span>Press <kbd className="font-sans font-semibold text-gray-500">Enter</kbd> to search</span>
          </p>
        </div>

      </section>
    </main>
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
