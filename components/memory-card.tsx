"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Calendar, Clock, User, X, Trash2, ShieldAlert } from "lucide-react"
import { loadModels, detectFaces, saveDetectedFaces } from "@/lib/faceDetectionService"
import { getDatabase, ref, onValue, remove } from "firebase/database"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useUser } from "@clerk/nextjs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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

interface DetectedFace {
  detection?: {
    box: {
      x: number
      y: number
      width: number
      height: number
    }
    score: number
  }
  landmarks?: Array<{ x: number, y: number }>
  name: string | null
  confidence?: string | null
  distance?: number | null
}

interface MemoryImage {
  id: string
  imgUrl: string
  location: Location
  timestamp: string
  detectedFaces?: DetectedFace[]
}

interface MemoryCardProps {
  memory: MemoryImage
  onViewDetails?: () => void  // Add this line to define the optional prop
}

interface KnownFace {
  name: string
  imageUrls: string[]
}

export default function MemoryCard({ memory, onViewDetails }: MemoryCardProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [faces, setFaces] = useState<DetectedFace[]>([])
  const [knownFaces, setKnownFaces] = useState<Record<string, KnownFace>>({})
  const [faceImageMap, setFaceImageMap] = useState<Record<string, string>>({})
  const [selectedPerson, setSelectedPerson] = useState<{ name: string, image: string, confidence: number | null } | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [hasDeleteAccess, setHasDeleteAccess] = useState(false)
  const [faceDetectionSkipped, setFaceDetectionSkipped] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { user } = useUser()

  // Parse timestamp (format: "2025-04-28_00-20-50")
  const dateParts = memory.timestamp.split("_")[0].split("-")
  const timeParts = memory.timestamp.split("_")[1].split("-")

  const year = dateParts[0]
  const month = dateParts[1]
  const day = dateParts[2]

  const hour = parseInt(timeParts[0])
  const minute = timeParts[1]

  // Convert to 12-hour format with AM/PM
  const period = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12 // Convert 0 to 12 for 12 AM
  const formattedTime = `${hour12}:${minute} ${period}`

  // Format date as DD/MM/YYYY instead of MM/DD/YYYY
  const formattedDate = `${day}/${month}/${year}`

  // Location details with null checks
  const city = memory.location?.detailed?.city || memory.location?.city || "Unknown Location"
  const state = memory.location?.detailed?.state || ""
  const address = memory.location?.detailed?.display_name || ""

  // Load face detection models on component mount
  useEffect(() => {
    loadModels()
  }, [])

  // Check if current user has delete access
  useEffect(() => {
    if (!user?.emailAddresses?.length) return

    const userEmail = user.emailAddresses[0].emailAddress
    const db = getDatabase()
    const supremeRef = ref(db, "supreme")

    const unsubscribe = onValue(supremeRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        // Check if user's email is in the supreme list
        const emails = Object.values(data)
        setHasDeleteAccess(emails.includes(userEmail))
      }
    })

    return () => unsubscribe()
  }, [user])

  // Fetch known faces from Firebase
  useEffect(() => {
    const db = getDatabase()
    const facesRef = ref(db, "faces")

    const unsubscribe = onValue(facesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setKnownFaces(data)

        // Create a map of person names to their face images
        const imageMap: Record<string, string> = {}
        Object.values(data).forEach((face: any) => {
          if (face.name && face.imageUrls && face.imageUrls.length > 0) {
            imageMap[face.name] = face.imageUrls[0] // Use the first image
          }
        })
        setFaceImageMap(imageMap)
      }
    })

    return () => unsubscribe()
  }, [])

  // Process image for face detection if needed
  useEffect(() => {
    const processImage = async () => {
      // Skip if already processed or currently processing
      if (memory.detectedFaces || isProcessing) return;

      setIsProcessing(true);

      // Add a timeout to prevent infinite processing
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Face detection timeout")), 10000); // 10 second timeout
      });

      try {
        // Race between face detection and timeout
        const result = await Promise.race([
          detectFaces(memory.imgUrl, knownFaces),
          timeoutPromise
        ]) as FaceDetectionResult;

        if (result.detectedFaces) {
          setFaces(result.detectedFaces);
          await saveDetectedFaces(memory.id, result.detectedFaces);
        }
      } catch (error) {
        console.error("Error processing image:", error);
        setFaceDetectionSkipped(true);
        // Save empty faces array to prevent future processing attempts
        await saveDetectedFaces(memory.id, []);
        toast.error("Face detection failed", {
          description: "Could not detect faces in this image."
        });
      } finally {
        setIsProcessing(false);
      }
    };

    // Only process if we have known faces to compare against and a maximum of 3 retries
    const retryCount = parseInt(localStorage.getItem(`retry-${memory.id}`) || "0");
    if (Object.keys(knownFaces).length > 0 && retryCount < 3) {
      processImage();
      localStorage.setItem(`retry-${memory.id}`, (retryCount + 1).toString());
    } else if (retryCount >= 3 && !memory.detectedFaces) {
      // If we've tried 3 times and still no faces, save empty array to prevent future attempts
      saveDetectedFaces(memory.id, []);
      setIsProcessing(false);
    }
  }, [memory, knownFaces, isProcessing]);

  // Draw face boxes on the image when faces are detected
  useEffect(() => {
    const drawFaceBoxes = () => {
      const img = imgRef.current
      const canvas = canvasRef.current

      if (!img || !canvas || !img.complete) return

      const facesToDraw = memory.detectedFaces || faces
      if (!facesToDraw || facesToDraw.length === 0) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Set canvas dimensions to match image
      canvas.width = img.width
      canvas.height = img.height

      // Clear previous drawings
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw boxes for each detected face
      facesToDraw.forEach(face => {
        // Skip faces without detection data
        if (!face.detection) return

        const { x, y, width, height } = face.detection.box

        // Calculate position relative to the displayed image
        const scaleX = img.width / img.naturalWidth
        const scaleY = img.height / img.naturalHeight

        const boxX = x * scaleX
        const boxY = y * scaleY
        const boxWidth = width * scaleX
        const boxHeight = height * scaleY

        // Draw face box with improved styling
        ctx.strokeStyle = '#3b82f6' // Blue color
        ctx.lineWidth = 2
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight)

        // If name is available, display it with improved styling
        if (face.name) {
          ctx.fillStyle = 'rgba(59, 130, 246, 0.85)' // Blue with opacity
          const textWidth = ctx.measureText(face.name).width + 10
          ctx.fillRect(boxX, boxY - 24, textWidth, 24)

          ctx.fillStyle = '#ffffff'
          ctx.font = 'bold 12px Inter, system-ui, sans-serif'
          ctx.fillText(face.name, boxX + 5, boxY - 8)
        }
      })
    }

    // Draw boxes when image is loaded
    const img = imgRef.current
    if (img) {
      if (img.complete) {
        drawFaceBoxes()
      } else {
        img.onload = drawFaceBoxes
      }
    }
  }, [faces, memory.detectedFaces])

  // Handle clicking outside the popup to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (selectedPerson && !target.closest('.person-popup') && !target.closest('.person-badge')) {
        setSelectedPerson(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [selectedPerson])

  // Handle person badge click
  const handlePersonClick = (name: string, image: string | null, confidence: string | null) => {
    const confidenceValue = confidence ? Math.round(parseFloat(confidence) * 100) : null
    setSelectedPerson({
      name,
      image: image || '',
      confidence: confidenceValue
    })
  }

  // Handle memory deletion
  const handleDeleteMemory = async () => {
    if (!memory.id) return

    setIsDeleting(true)
    const db = getDatabase()

    try {
      // Delete the memory from Firebase
      await remove(ref(db, `images/${memory.id}`))
      toast.success("Memory deleted successfully")
    } catch (error) {
      console.error("Error deleting memory:", error)
      toast.error("Failed to delete memory")
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  return (
    <>
      <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col bg-white rounded-lg border border-slate-200">
        {/* Image section with 16:9 aspect ratio */}
        <div className="relative w-full pt-[56.25%] overflow-hidden"> {/* 56.25% = 9/16 * 100% for 16:9 ratio */}
          <img
            ref={imgRef}
            src={memory.imgUrl || "/placeholder.svg"}
            alt={`Memory from ${formattedDate}`}
            className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg?height=300&width=400"
            }}
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
          />

          {/* Date overlay with gradient */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-12 pb-3 px-4">
            <div className="flex flex-wrap items-center gap-2">
              <Calendar className="h-4 w-4 text-white/90" />
              <p className="text-sm font-medium text-white">{formattedDate}</p>
              <span className="mx-1 text-white/60">•</span>
              <Clock className="h-4 w-4 text-white/90" />
              <p className="text-sm font-medium text-white">{formattedTime}</p>
            </div>
          </div>

          {/* Delete button - only show if user has delete access */}
          {hasDeleteAccess && (
            <button
              onClick={() => setDeleteDialogOpen(true)}
              className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-red-500 transition-colors z-10"
              aria-label="Delete memory"
            >
              <Trash2 size={16} />
            </button>
          )}

          {/* Show processing indicator */}
          {isProcessing && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white rounded-lg px-4 py-3 shadow-xl flex items-center gap-3">
                <div className="animate-spin h-5 w-5 border-3 border-slate-300 border-t-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-800">Processing image...</span>
              </div>
            </div>
          )}
        </div>

        <CardContent className="p-3 sm:p-4 md:p-5 flex-grow space-y-3 sm:space-y-4 md:space-y-5">
          {faceDetectionSkipped && (
            <div className="text-amber-600 text-xs mt-1 flex items-center gap-2">
              <ShieldAlert className="h-3 w-3" />
              <span>Face detection skipped</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFaceDetectionSkipped(false);
                  localStorage.removeItem(`retry-${memory.id}`);
                  setFaces([]);
                  setIsProcessing(false);
                }}
                className="text-xs ml-2"
              >
                Retry Detection
              </Button>
            </div>
          )}
          {/* Detected faces with improved badge style */}
          {((memory.detectedFaces && memory.detectedFaces.length > 0) || faces.length > 0) && (
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-700 mb-2 sm:mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-blue-500" />
                People in this memory
              </h3>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {(memory.detectedFaces || faces)
                  .filter(face => face.name) // Only show faces with names
                  .map((face, index) => {
                    // Get the face image URL from our map
                    const faceImageUrl = face.name ? faceImageMap[face.name] : null;
                    const confidence = face.confidence ? Math.round(parseFloat(face.confidence) * 100) : null;

                    return (
                      <div
                        key={index}
                        className="person-badge flex items-center bg-slate-50 border border-slate-200 rounded-full pr-2 sm:pr-3 pl-0.5 py-0.5 overflow-hidden shadow-sm hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
                        onClick={() => handlePersonClick(face.name || 'Unknown', faceImageUrl, face.confidence || null)}
                      >
                        <Avatar className="h-6 w-6 sm:h-7 sm:w-7 rounded-full border border-slate-200">
                          {faceImageUrl ? (
                            <AvatarImage
                              src={faceImageUrl}
                              alt={face.name || 'Unknown'}
                              className="object-cover"
                            />
                          ) : (
                            <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-medium">
                              {face.name?.charAt(0)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="ml-1 sm:ml-1.5 flex flex-col">
                          <span className="text-xs font-medium text-slate-800 leading-tight">
                            {face.name}
                          </span>
                          {confidence && (
                            <span className="text-[9px] sm:text-[10px] text-blue-600 leading-tight">
                              {confidence}% match
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Location with improved styling */}
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-slate-700 mb-2 sm:mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-500" />
              Location
            </h3>
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-2 sm:p-3">
              <p className="text-sm font-medium text-slate-800">
                {city}{state ? `, ${state}` : ''}
              </p>
              {address && (
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-snug">{address}</p>
              )}
            </div>
          </div>

          {/* View Details Button removed as requested */}
        </CardContent>
      </Card>

      {/* Person Popup */}
      {selectedPerson && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="person-popup bg-white rounded-lg shadow-xl max-w-sm w-full overflow-hidden">
            <div className="relative">
              <div className="h-48 sm:h-56 bg-slate-100 flex items-center justify-center">
                {selectedPerson.image ? (
                  <img
                    src={selectedPerson.image}
                    alt={selectedPerson.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-4xl font-medium">
                    {selectedPerson.name.charAt(0)}
                  </div>
                )}
              </div>
              <button
                className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
                onClick={() => setSelectedPerson(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold text-slate-800 mb-2">{selectedPerson.name}</h3>
              {selectedPerson.confidence !== null && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600">Match confidence</span>
                    <span className="text-sm font-medium text-blue-600">{selectedPerson.confidence}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${selectedPerson.confidence}%` }}
                    ></div>
                  </div>
                </div>
              )}
              <button
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-sm font-medium transition-colors"
                onClick={() => setSelectedPerson(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Memory</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this memory? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMemory}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeleting ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

interface FaceDetectionResult {
  detectedFaces: DetectedFace[]
  error?: string
}
