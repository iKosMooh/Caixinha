import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import BottomNav from '@/components/BottomNav'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'
import SplashScreen from '@/components/SplashScreen'
import PinGate from '@/components/PinGate'
import { getEffectivePin } from '@/lib/config'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'Caixinha',
  description: 'Controle de despensa para toda a família',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Caixinha' },
}

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const hasPin = getEffectivePin() !== null
  return (
    <html lang="pt-BR" className={geist.variable}>
      <body className="bg-gray-50 text-gray-900 antialiased min-h-screen pb-20">
        <SplashScreen />
        <PinGate hasPin={hasPin} />
        <ServiceWorkerRegister />
        <main className="mx-auto w-[98%] sm:w-[85%] md:w-[45%] px-4 pt-6">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  )
}
