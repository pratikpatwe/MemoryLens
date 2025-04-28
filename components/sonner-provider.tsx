"use client"

import { Toaster } from "sonner"

export function SonnerProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "white",
          color: "hsl(222.2, 47.4%, 11.2%)",
          border: "1px solid hsl(214.3, 31.8%, 91.4%)",
        },
        duration: 3000,
      }}
    />
  )
}
