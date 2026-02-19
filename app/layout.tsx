import type { Metadata } from 'next'
import './globals.css'
import './globals.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'PillPal - Healthcare Assistant',
  description: 'AI-powered healthcare assistant for symptom analysis and treatment suggestions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50" suppressHydrationWarning={true}>
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          {children}
        </main>
        <div className="fixed bottom-6 left-0 right-0 flex justify-center pointer-events-none z-0">
          <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-full px-6 py-2 shadow-lg flex items-center gap-3 text-sm text-gray-500 max-w-2xl mx-4 pointer-events-auto hover:bg-white transition-colors">
            <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-orange-100 text-orange-600 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </span>
            <span className="flex-1">
              <strong>Medical Disclaimer:</strong> This AI tool is for informational purposes only and not a substitute for professional medical comparison.
              <span className="hidden sm:inline"> Always consult a doctor for health concerns.</span>
            </span>
          </div>
        </div>
      </body>
    </html>
  )
}
