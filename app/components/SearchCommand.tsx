'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Search,
  Clock,
  X,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowUp,
  ArrowDown,
  CornerDownLeft,
  Command,
  MessageSquare,
  Music,
  Users
} from 'lucide-react'

// Mock Data
const RECENT_SEARCHES = [
  { id: 1, text: 'Package Status' },
  { id: 2, text: 'Extra Raw Genre' },
]

const STATUS_ITEMS = [
  { id: 's1', label: 'On Process', color: 'bg-purple-500', icon: Loader2 },
  { id: 's2', label: 'Success', color: 'bg-green-500', icon: CheckCircle2 },
  { id: 's3', label: 'Failed', color: 'bg-red-500', icon: AlertCircle },
]

const INTEGRATION_ITEMS = [
  { id: 'i1', label: 'Slack', icon: MessageSquare, color: 'text-purple-600' }, // Approximation for Slack
  { id: 'i2', label: 'Microsoft Teams', icon: Users, color: 'text-blue-600' }, // Approximation
  { id: 'i3', label: 'Spotify', icon: Music, color: 'text-green-500' }, // Approximation
]

export default function SearchCommand() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [activeTab, setActiveTab] = useState('all')
  const inputRef = useRef<HTMLInputElement>(null)

  // Groups and Items
  // Flatten items for navigation logic
  const allItems = [
    // We navigate through recent searches first? Usually Command Palettes skip history?
    // Let's assume navigation goes through status then integrations.
    // Or maybe history is clickable too.
    ...RECENT_SEARCHES.map(item => ({ ...item, type: 'recent' })),
    ...STATUS_ITEMS.map(item => ({ ...item, type: 'status' })),
    ...INTEGRATION_ITEMS.map(item => ({ ...item, type: 'integration' }))
  ]

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    const handleOpenEvent = () => setIsOpen(true)

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('open-search-modal', handleOpenEvent)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('open-search-modal', handleOpenEvent)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Navigation Logic
  useEffect(() => {
    const handleNavigation = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % allItems.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + allItems.length) % allItems.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        // Handle selection
        setIsOpen(false)
      }
    }

    if (isOpen) {
      // Only attach when open to avoid conflicts
      window.addEventListener('keydown', handleNavigation)
      return () => window.removeEventListener('keydown', handleNavigation)
    }
  }, [isOpen, selectedIndex, allItems.length])


  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-xl bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-white/20 ring-1 ring-black/5">

        {/* Search Header */}
        <div className="flex items-center px-4 py-4 border-b border-gray-100/50 bg-white/40">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search something..."
            className="flex-1 bg-transparent outline-none text-gray-700 placeholder:text-gray-400 text-lg font-medium"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Filters / Tabs */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100/50 bg-gray-50/30 text-sm backdrop-blur-md">
          <button
            onClick={() => setActiveTab('status')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors ${activeTab === 'status' ? 'bg-white shadow-sm text-gray-800' : 'hover:bg-black/5 text-gray-600'}`}
          >
            <span className="w-4 h-4 rounded bg-gray-200/80 flex items-center justify-center">
              <Command className="w-2.5 h-2.5" />
            </span>
            Status
            <ChevronDown className="w-3 h-3 opacity-50" />
          </button>
          <button
            onClick={() => setActiveTab('collaborators')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors ${activeTab === 'collaborators' ? 'bg-white shadow-sm text-gray-800' : 'hover:bg-black/5 text-gray-600'}`}
          >
            <Users className="w-3.5 h-3.5" />
            Collaborators
            <ChevronDown className="w-3 h-3 opacity-50" />
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors ${activeTab === 'integrations' ? 'bg-white shadow-sm text-gray-800' : 'hover:bg-black/5 text-gray-600'}`}
          >
            <div className="w-3.5 h-3.5 border border-current rounded-sm flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-current rounded-full" />
            </div>
            Integrations
            <ChevronDown className="w-3 h-3 opacity-50" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[60vh] p-2 bg-transparent">

          {/* Recent Search */}
          {RECENT_SEARCHES.length > 0 && (
            <div className="mb-2">
              <h3 className="text-[11px] font-semibold text-gray-400 px-3 py-2 uppercase tracking-wider">Recent Search</h3>
              <div className="space-y-0.5">
                {RECENT_SEARCHES.map((item, idx) => {
                  const isSelected = selectedIndex === idx
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-gray-200/60' : 'hover:bg-gray-100'
                        }`}
                      onClick={() => {
                        setSelectedIndex(idx)
                      }}
                    >
                      <div className="flex items-center gap-3 text-gray-700">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-[15px] font-medium">{item.text}</span>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-200">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Status Group */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-400 px-3 py-2 uppercase tracking-wider">Status</h3>
            <div className="space-y-0.5">
              {STATUS_ITEMS.map((item, idx) => {
                const globalIndex = RECENT_SEARCHES.length + idx
                const isSelected = selectedIndex === globalIndex
                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors group ${isSelected ? 'bg-gray-200/60' : 'hover:bg-gray-100'
                      }`}
                    onClick={() => setSelectedIndex(globalIndex)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                      <span className="text-[15px] font-medium text-gray-700">{item.label}</span>
                    </div>
                    <div className={`text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ${isSelected ? 'opacity-100' : ''}`}>
                      <CornerDownLeft className="w-3.5 h-3.5" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Integrations Group */}
          <div className="mb-2">
            <h3 className="text-xs font-semibold text-gray-400 px-3 py-2 uppercase tracking-wider">Integrations</h3>
            <div className="space-y-0.5">
              {INTEGRATION_ITEMS.map((item, idx) => {
                const globalIndex = RECENT_SEARCHES.length + STATUS_ITEMS.length + idx
                const isSelected = selectedIndex === globalIndex
                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors group ${isSelected ? 'bg-gray-200/60' : 'hover:bg-gray-100'
                      }`}
                    onClick={() => setSelectedIndex(globalIndex)}
                  >
                    <div className="flex items-center gap-3">
                      {/* Icon container */}
                      <div className="w-5 h-5 flex items-center justify-center">
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                      </div>
                      <span className="text-[15px] font-medium text-gray-700">{item.label}</span>
                    </div>
                    <div className={`text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ${isSelected ? 'opacity-100' : ''}`}>
                      <CornerDownLeft className="w-3.5 h-3.5" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 font-medium">
          <div className="flex items-center gap-1">
            <span className="bg-gray-200 rounded px-1 min-w-[18px] h-5 flex items-center justify-center">
              <ArrowUp className="w-3 h-3" />
            </span>
            <span className="bg-gray-200 rounded px-1 min-w-[18px] h-5 flex items-center justify-center">
              <ArrowDown className="w-3 h-3" />
            </span>
            <span className="ml-1">to Navigate</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="bg-gray-200 rounded px-1.5 h-5 flex items-center justify-center">
              <CornerDownLeft className="w-3 h-3" />
            </span>
            <span className="ml-1">to Select</span>
          </div>
        </div>

      </div>
    </div>
  )
}
