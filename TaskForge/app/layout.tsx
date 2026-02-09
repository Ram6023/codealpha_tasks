import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'

import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const viewport: Viewport = {
  themeColor: '#8b5cf6',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'TaskForge — Premium Project Management',
  description: 'Elevate your workflow with TaskForge. Manage projects, organize tasks, and collaborate with your team using beautiful Kanban boards.',
  keywords: ['project management', 'kanban', 'task management', 'team collaboration', 'productivity'],
  authors: [{ name: 'TaskForge Team' }],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'TaskForge — Premium Project Management',
    description: 'Elevate your workflow with TaskForge. Beautiful Kanban boards for modern teams.',
    type: 'website',
    siteName: 'TaskForge',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TaskForge — Premium Project Management',
    description: 'Elevate your workflow with TaskForge. Beautiful Kanban boards for modern teams.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
