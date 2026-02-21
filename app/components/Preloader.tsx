'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pill } from 'lucide-react'

export default function Preloader() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Artificial aesthetic delay to let the animation play out.
    // Ensure the loading screen shows for at least a brief moment so it doesn't flash.
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    // Ensure the page doesn't scroll while preloading
    const originalStyle = window.getComputedStyle(document.body).overflow
    document.body.style.overflow = 'hidden'

    return () => {
      clearTimeout(timer)
      document.body.style.overflow = originalStyle
    }
  }, [])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-50"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 0.8, bounce: 0.5 }}
            className="relative flex items-center justify-center"
          >
            {/* The pulsing background effect */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0, 0.5, 0],
              }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="absolute inset-0 bg-gray-300 rounded-3xl blur-xl"
            />

            {/* The icon container referencing the PillPal styling */}
            <div className="relative z-10 w-20 h-20 rounded-3xl bg-zinc-900 shadow-2xl flex items-center justify-center text-white">
              <Pill className="w-10 h-10" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-6 font-medium tracking-wide text-gray-400 text-sm"
          >
            Loading...
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
