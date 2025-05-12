"use client"

import { useEffect, useState } from "react"
import { initializeApp } from "firebase/app"
import { getDatabase, ref, onValue, set, push } from "firebase/database"
import { Play, Pause, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { format } from "date-fns"
import MemoryCard from "@/components/memory-card"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import Link from "next/link"

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const database = getDatabase(app)

// Types
interface Location {
  city: string
  country: string
  detailed: {
    city: string
    country: string
    display_name: string
    state: string
    suburb: string
  }
  latitude: number
  longitude: number
}

// Update the MemoryImage interface
interface MemoryImage {
  id: string
  imgUrl: string
  location: Location
  timestamp: string
  detectedFaces?: Array<{
    detection: {
      box: {
        x: number
        y: number
        width: number
        height: number
      }
      score: number
    }
    landmarks: Array<{ x: number, y: number }>
    name: string | null
    distance: number | null
  }>
}

export default function AppPage() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [status, setStatus] = useState<string>("0")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [memories, setMemories] = useState<MemoryImage[]>([])
  const [isProcessing, setIsProcessing] = useState<boolean>(false)

  useEffect(() => {
    toast.loading("Loading MemoryLens...", {
      id: "app-loading",
    })

    return () => {
      toast.dismiss("app-loading")
    }
  }, [])

  useEffect(() => {
    // Update current date every minute
    const interval = setInterval(() => {
      setCurrentDate(new Date())
    }, 60000)

    // Fetch status from Firebase
    const statusRef = ref(database, "status")
    const statusUnsubscribe = onValue(statusRef, (snapshot) => {
      const data = snapshot.val()
      setStatus(data)
      setIsLoading(false)
      toast.dismiss("app-loading")
      toast.success("MemoryLens loaded successfully")
    })

    // Fetch memories from Firebase
    const imagesRef = ref(database, "images")
    const imagesUnsubscribe = onValue(imagesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const memoriesArray = Object.entries(data).map(([id, value]: [string, any]) => ({
          id,
          ...value,
        }))
        // Sort by timestamp (newest first)
        memoriesArray.sort((a, b) => {
          // Add null checks before using localeCompare
          if (!a.timestamp && !b.timestamp) return 0;
          if (!a.timestamp) return 1; // b comes first if a has no timestamp
          if (!b.timestamp) return -1; // a comes first if b has no timestamp
          return b.timestamp.localeCompare(a.timestamp);
        })
        setMemories(memoriesArray)
      } else {
        setMemories([])
      }
    })

    return () => {
      clearInterval(interval)
      statusUnsubscribe()
      imagesUnsubscribe()
    }
  }, [])

  const toggleStatus = () => {
    setIsProcessing(true)
    const newStatus = status === "0" ? "1" : "0"

    // Set the new status in Firebase
    set(ref(database, "status"), newStatus)
      .then(() => {
        // Simulate a processing delay for visual feedback
        setTimeout(() => {
          setIsProcessing(false)

          // Show toast notification
          if (newStatus === "1") {
            toast.success("MemoryLens started capturing memories", {
              description: "The device will now automatically capture images at set intervals.",
              icon: <Play className="h-4 w-4" />,
            })
          } else {
            toast.info("MemoryLens stopped capturing memories", {
              description: "The device has stopped capturing images.",
              icon: <Pause className="h-4 w-4" />,
            })
          }
        }, 1000)
      })
      .catch((error) => {
        console.error("Error updating status:", error)
        setIsProcessing(false)
        toast.error("Failed to update status", {
          description: error.message,
        })
      })
  }

  const handleViewDetails = (memory: MemoryImage) => {
    // This would typically navigate to a details page
    // For now, we'll just show a toast
    const dateParts = memory.timestamp.split("_")[0].split("-")
    const formattedDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`

    toast("Memory Details", {
      description: `Viewing memory from ${formattedDate}`,
      action: {
        label: "Close",
        onClick: () => console.log("Closed"),
      },
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <Header />

      {/* Top Section */}
      <section className="bg-white border-b border-slate-200 py-6">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-slate-900 font-medium">{format(currentDate, "EEEE, MMMM d, yyyy")}</div>
            <div className="flex items-center gap-3">
              <Button
                onClick={toggleStatus}
                disabled={isLoading || isProcessing}
                className={cn(
                  "px-6 py-2 transition-all duration-300",
                  status === "1"
                    ? "bg-amber-600 hover:bg-amber-700 shadow-md hover:shadow-lg"
                    : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg",
                  isProcessing && "relative overflow-hidden"
                )}
                size="lg"
              >
                {isLoading ? (
                  "Loading..."
                ) : status === "1" ? (
                  <>
                    <Pause className="mr-2 h-5 w-5" /> Stop Capturing
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-5 w-5" /> Start Capturing
                  </>
                )}
                {isProcessing && <div className="absolute inset-0 bg-white/20 backdrop-blur-sm animate-pulse"></div>}
              </Button>

              <Link href="/app/train-face" passHref>
                <Button
                  variant="outline"
                  className="border-blue-500 text-blue-600 hover:bg-blue-50 px-6 py-2 shadow-sm hover:shadow-md transition-all duration-300"
                  size="lg"
                >
                  <Brain className="mr-2 h-5 w-5 text-blue-500" /> Train Faces
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Memory Cards */}
      <section className="py-8 flex-grow">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Memories</h2>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-4 h-80 animate-pulse">
                  <div className="w-full h-40 bg-slate-200 rounded-md mb-4"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6 mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                </Card>
              ))}
            </div>
          ) : memories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600">No memories captured yet. Click Start to begin capturing memories.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {memories.map((memory) => {
                // Skip rendering if essential data is missing
                if (!memory || !memory.timestamp) {
                  return null
                }

                return <MemoryCard key={memory.id} memory={memory} onViewDetails={() => handleViewDetails(memory)} />
              })}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
