import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "MemoryLens App",
  description: "Helping People Remember Life's Important Moments",
}

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <div className="min-h-screen bg-slate-50 flex flex-col">{children}</div>
}
