import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientOnly from './components/ClientOnly'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Interview Eye Tracker',
  description: 'Professional interview platform with real-time eye tracking and video recording',
  keywords: ['interview', 'eye tracking', 'video recording', 'MediaPipe', 'Next.js'],
  authors: [{ name: 'Interview Eye Tracker Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        {/* MediaPipe Scripts */}
        <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" crossOrigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js" crossOrigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js" crossOrigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js" crossOrigin="anonymous"></script>
        <script src="/scripts/cleanup-extensions.js" defer></script>
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ClientOnly>
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
        </ClientOnly>
      </body>
    </html>
  )
}
