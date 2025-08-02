import type { Metadata } from 'next'
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
        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="container mx-auto px-4 py-6 max-w-6xl">
            <div className="text-center text-sm text-gray-600">
              <p className="font-semibold text-red-600 mb-2">⚠️ Medical Disclaimer</p>
              <p>
                This application is for informational purposes only and is not intended to be a substitute for professional medical advice, diagnosis, or treatment. 
                Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
