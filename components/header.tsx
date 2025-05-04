"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScanEye, Menu, X } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useUser, UserButton, SignedIn, SignedOut } from "@clerk/nextjs"

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const router = useRouter()
  const { user } = useUser()

  const navLinks = [
    { name: "Mission", href: "/#mission" },
    { name: "Project", href: "/#project" },
    { name: "Team", href: "/#team" },
    { name: "Mentor", href: "/#mentor" },
    { name: "App", href: "/app" },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="container mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <ScanEye className="h-8 w-8 text-slate-900" />
            <span className="font-bold text-xl text-slate-900">MemoryLens</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-slate-700 hover:text-slate-900 font-medium transition-colors"
              >
                {link.name}
              </Link>
            ))}

            {/* Authentication UI */}
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>

            <SignedOut>
              <Button onClick={() => router.push('/sign-in')}>
                Login
              </Button>
            </SignedOut>
          </nav>

          {/* Mobile Authentication and Menu */}
          <div className="md:hidden flex items-center gap-3">
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6 text-slate-900" /> : <Menu className="h-6 w-6 text-slate-900" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobile && mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-slate-700 hover:text-slate-900 font-medium py-2 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}

            {/* Mobile Login Button (only for signed out users) */}
            <SignedOut>
              <Button
                className="mt-2"
                onClick={() => {
                  router.push('/sign-in');
                  setMobileMenuOpen(false);
                }}
              >
                Login
              </Button>
            </SignedOut>

            {/* User info (only for signed in users) */}
            <SignedIn>
              <div className="flex items-center gap-3 py-2">
                {user && (
                  <span className="text-sm font-medium text-slate-900">
                    {user.firstName || user.username || 'User'}
                  </span>
                )}
              </div>
            </SignedIn>
          </div>
        </div>
      )}
    </header>
  )
}
