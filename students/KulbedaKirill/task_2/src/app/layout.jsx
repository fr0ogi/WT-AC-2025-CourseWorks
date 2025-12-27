import { Geist, Geist_Mono } from 'next/font/google'
import '@radix-ui/themes/styles.css'
import './globals.css'
import { Theme } from '@radix-ui/themes'
import AuthGuard from '@/components/AuthGuard'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata = {
  title: 'Helpdesk',
  description: 'Helpdesk',
}

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Theme appearance='light'>
          <AuthGuard>{children}</AuthGuard>
        </Theme>
      </body>
    </html>
  )
}
