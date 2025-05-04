import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { SonnerProvider } from "@/components/sonner-provider"
import {
  ClerkProvider,
} from '@clerk/nextjs'

export const metadata: Metadata = {
  title: "MemoryLens",
  description: "A smart memory device",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          {children}
          <SonnerProvider />
        </body>
      </html>
    </ClerkProvider>
  )
}
