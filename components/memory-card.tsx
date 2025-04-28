"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { MapPin, Calendar, Clock } from "lucide-react"

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

interface MemoryImage {
  id: string
  imgUrl: string
  location: Location
  timestamp: string
}

interface MemoryCardProps {
  memory: MemoryImage
  onViewDetails?: () => void
}

export default function MemoryCard({ memory, onViewDetails }: MemoryCardProps) {
  // Parse timestamp (format: "2025-04-28_00-20-50")
  const dateParts = memory.timestamp.split("_")[0].split("-")
  const timeParts = memory.timestamp.split("_")[1].split("-")

  const year = dateParts[0]
  const month = dateParts[1]
  const day = dateParts[2]

  const hour = timeParts[0]
  const minute = timeParts[1]
  const second = timeParts[2]

  const formattedDate = `${month}/${day}/${year}`
  const formattedTime = `${hour}:${minute}:${second}`

  // Location details with null checks
  const city = memory.location?.detailed?.city || memory.location?.city || "Unknown Location"
  const state = memory.location?.detailed?.state || ""
  const address = memory.location?.detailed?.display_name || ""

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <img
          src={memory.imgUrl || "/placeholder.svg"}
          alt={`Memory from ${formattedDate}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg?height=300&width=400"
          }}
        />
      </div>
      <CardContent className="p-4 flex-grow">
        <div className="flex items-start gap-3 mb-3">
          <Calendar className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-slate-900">{formattedDate}</p>
            <div className="flex items-center gap-1 text-slate-500 text-sm">
              <Clock className="h-3.5 w-3.5" />
              <span>{formattedTime}</span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-slate-900">
              {city}, {state}
            </p>
            <p className="text-sm text-slate-500 line-clamp-2">{address}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-end border-t border-slate-100">
        <button
          className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          onClick={onViewDetails}
        >
          View Details
        </button>
      </CardFooter>
    </Card>
  )
}
