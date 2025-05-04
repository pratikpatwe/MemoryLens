"use client"

import { useState, useEffect } from "react"
import { initializeApp } from "firebase/app"
import { getDatabase, ref, push, onValue, remove } from "firebase/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import Header from "@/components/header"
import { toast } from "sonner"
import { CheckCircle, Upload, X, Trash2, ShieldAlert, ChevronRight, ChevronLeft } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

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

// ImageKit configuration
const imagekitEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/yourendpoint"
const imagekitPublicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || ""

interface FaceData {
  name: string
  imageUrls: string[]
}

interface Face extends FaceData {
  id: string
}

export default function TrainFacesPage() {
  const [name, setName] = useState<string>("") 
  const [images, setImages] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
  const [uploadProgress, setUploadProgress] = useState<number[]>([0, 0, 0])
  const [faces, setFaces] = useState<Face[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [hasAccess, setHasAccess] = useState<boolean>(false)
  const [accessChecked, setAccessChecked] = useState<boolean>(false)
  const [selectedFace, setSelectedFace] = useState<Face | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0)
  const { user } = useUser()
  const router = useRouter()

  // Check if user has access to this page
  useEffect(() => {
    if (!user?.emailAddresses?.length) return
    
    const userEmail = user.emailAddresses[0].emailAddress
    const db = getDatabase()
    
    // First, check if all users are allowed to train
    const allowAllRef = ref(db, "allow-all-to-train")
    
    onValue(allowAllRef, (snapshot) => {
      const allowAllValue = snapshot.val()
      
      if (allowAllValue === 1 || allowAllValue === "1") {
        // If allow-all-to-train is 1, grant access to everyone
        setHasAccess(true)
        setAccessChecked(true)
      } else {
        // If not, check if the user's email is in the supreme list
        const supremeRef = ref(db, "supreme")
        
        onValue(supremeRef, (snapshot) => {
          const data = snapshot.val()
          if (data) {
            // Check if user's email is in the supreme list
            const emails = Object.values(data)
            const userHasAccess = emails.includes(userEmail)
            setHasAccess(userHasAccess)
            
            // If user doesn't have access, show toast and redirect
            if (!userHasAccess) {
              toast.error("Access Denied", {
                description: "You don't have permission to access this page.",
                duration: 5000,
              })
              router.push("/app")
            }
          } else {
            setHasAccess(false)
            toast.error("Access Denied", {
              description: "You don't have permission to access this page.",
              duration: 5000,
            })
            router.push("/app")
          }
          setAccessChecked(true)
        })
      }
    })
    
    return () => {
      // No need to unsubscribe as Firebase handles this automatically when component unmounts
    }
  }, [user, router])

  // Fetch faces from Firebase
  useEffect(() => {
    // Only fetch faces if user has access
    if (!hasAccess) return
    
    const facesRef = ref(database, "faces")
    const unsubscribe = onValue(facesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const facesArray = Object.entries(data).map(([id, value]: [string, any]) => ({
          id,
          ...value,
        }))
        setFaces(facesArray)
      } else {
        setFaces([])
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [hasAccess])

  // Function to handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const newImages = [...images]
      newImages[index] = file
      setImages(newImages)

      // Preview the image
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          const newImageUrls = [...imageUrls]
          newImageUrls[index] = event.target.result as string
          setImageUrls(newImageUrls)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Function to remove an image
  const removeImage = (index: number) => {
    const newImages = [...images]
    newImages[index] = null as unknown as File
    setImages(newImages)

    const newImageUrls = [...imageUrls]
    newImageUrls[index] = ""
    setImageUrls(newImageUrls)
  }

  // Function to upload an image to ImageKit
  const uploadImageToImageKit = async (file: File, index: number): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        // First, get authentication parameters from your backend
        const authResponse = await fetch("/api/imagekit-auth")
        const authData = await authResponse.json()

        if (!authResponse.ok) {
          throw new Error("Failed to get authentication parameters")
        }

        const formData = new FormData()
        formData.append("file", file)
        formData.append("publicKey", imagekitPublicKey)
        formData.append("signature", authData.signature)
        formData.append("expire", authData.expire)
        formData.append("token", authData.token)
        formData.append("fileName", `face_${name.replace(/\s+/g, "_").toLowerCase()}_${index}`)
        formData.append("folder", "/faces")

        const xhr = new XMLHttpRequest()

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100)
            const newProgress = [...uploadProgress]
            newProgress[index] = percentComplete
            setUploadProgress(newProgress)
          }
        })

        xhr.onload = function () {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText)
            resolve(response.url)
          } else {
            reject(new Error("Upload failed"))
          }
        }

        xhr.onerror = function () {
          reject(new Error("Upload failed"))
        }

        xhr.open("POST", "https://upload.imagekit.io/api/v1/files/upload")
        xhr.send(formData)
      } catch (error) {
        reject(error)
      }
    })
  }

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name) {
      toast.error("Please enter a name")
      return
    }

    if (images.filter(Boolean).length < 3) {
      toast.error("Please upload 3 images")
      return
    }

    setIsSubmitting(true)
    const uploadedImageUrls: string[] = []

    try {
      // Upload each image to ImageKit
      for (let i = 0; i < images.length; i++) {
        if (images[i]) {
          const imageUrl = await uploadImageToImageKit(images[i], i)
          uploadedImageUrls.push(imageUrl)
        }
      }

      // Save data to Firebase
      const faceData: FaceData = {
        name,
        imageUrls: uploadedImageUrls,
      }

      await push(ref(database, "faces"), faceData)

      setIsSubmitted(true)
      toast.success("Face data saved successfully")
    } catch (error) {
      console.error("Error submitting form:", error)
      toast.error("Failed to save face data")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to delete a face
  const handleDeleteFace = async (faceId: string) => {
    try {
      setIsDeleting(faceId)
      await remove(ref(database, `faces/${faceId}`))
      toast.success("Face deleted successfully")
      if (selectedFace?.id === faceId) {
        setSelectedFace(null)
      }
    } catch (error) {
      console.error("Error deleting face:", error)
      toast.error("Failed to delete face")
    } finally {
      setIsDeleting(null)
    }
  }

  const resetForm = () => {
    setName("")
    setImages([])
    setImageUrls([])
    setIsSubmitted(false)
    setUploadProgress([0, 0, 0])
  }

  // Function to view face details
  const handleViewFace = (face: Face) => {
    setSelectedFace(face)
    setCurrentImageIndex(0)
  }

  // Function to navigate through face images
  const navigateImages = (direction: 'next' | 'prev') => {
    if (!selectedFace || !selectedFace.imageUrls) return
    
    const totalImages = selectedFace.imageUrls.length
    if (direction === 'next') {
      setCurrentImageIndex((prev) => (prev + 1) % totalImages)
    } else {
      setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages)
    }
  }

  // Show loading state while checking access
  if (!accessChecked) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600">Checking access...</p>
          </div>
        </div>
      </div>
    )
  }

  // If access check is complete but user doesn't have access, show access denied
  // This is a fallback in case the redirect doesn't happen immediately
  if (accessChecked && !hasAccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Card className="p-8 max-w-md text-center">
            <div className="flex justify-center mb-4">
              <ShieldAlert className="h-16 w-16 text-red-500" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">Access Denied</h2>
            <p className="text-slate-700 mb-6">
              You don't have permission to access this page.
            </p>
            <Button onClick={() => router.push("/app")}>
              Return to Dashboard
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <div className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Train Faces</h1>

        {/* Face Detail Modal */}
        {selectedFace && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-900">{selectedFace.name}</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedFace(null)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <X size={20} />
                </Button>
              </div>
              
              <div className="relative">
                {/* Image Gallery */}
                <div className="aspect-video bg-slate-100 relative overflow-hidden">
                  {selectedFace.imageUrls && selectedFace.imageUrls.length > 0 ? (
                    <img 
                      src={selectedFace.imageUrls[currentImageIndex]} 
                      alt={`${selectedFace.name} - Image ${currentImageIndex + 1}`}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-slate-500">No images available</p>
                    </div>
                  )}
                  
                  {/* Image Navigation */}
                  {selectedFace.imageUrls && selectedFace.imageUrls.length > 1 && (
                    <>
                      <button 
                        onClick={() => navigateImages('prev')}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
                        aria-label="Previous image"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button 
                        onClick={() => navigateImages('next')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
                        aria-label="Next image"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}
                </div>
                
                {/* Image Thumbnails */}
                {selectedFace.imageUrls && selectedFace.imageUrls.length > 1 && (
                  <div className="flex justify-center gap-2 p-4 bg-slate-50 border-t border-slate-200">
                    {selectedFace.imageUrls.map((url, index) => (
                      <button 
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-16 h-16 rounded-md overflow-hidden border-2 ${currentImageIndex === index ? 'border-blue-500' : 'border-transparent'}`}
                      >
                        <img 
                          src={url} 
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-4 flex justify-between">
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedFace(null)}
                >
                  Close
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleDeleteFace(selectedFace.id)}
                  disabled={isDeleting === selectedFace.id}
                >
                  {isDeleting === selectedFace.id ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                      Deleting...
                    </>
                  ) : (
                    <>Delete Face</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {isSubmitted ? (
          <Card className="p-8 text-center mb-8">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">Face Training Complete!</h2>
            <p className="text-slate-700 mb-6">
              The face data has been successfully saved and will be used for recognition.
            </p>
            <Button onClick={resetForm}>Train Another Face</Button>
          </Card>
        ) : (
          <div className="flex flex-col space-y-8">
            {/* Add New Face Section - Now at the top */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Add New Face</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <Label htmlFor="name" className="mb-2 block">
                    Person's Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full"
                    required
                  />
                </div>

                <div className="mb-6">
                  <Label className="mb-2 block">Face Images (3 required)</Label>
                  <p className="text-sm text-slate-600 mb-4">
                    Upload 3 clear images of the person's face from different angles.
                  </p>

                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    {[0, 1, 2].map((index) => (
                      <div key={index} className="relative">
                        {imageUrls[index] ? (
                          <div className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                            <img
                              src={imageUrls[index]}
                              alt={`Face ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-red-500 transition-colors"
                              aria-label="Remove image"
                            >
                              <X size={14} />
                            </button>
                            {uploadProgress[index] > 0 && uploadProgress[index] < 100 && (
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <div className="bg-white rounded-lg px-2 py-1 text-xs font-medium">
                                  {uploadProgress[index]}%
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                            <div className="flex flex-col items-center justify-center p-2 text-center">
                              <Upload className="h-5 w-5 sm:h-8 sm:w-8 text-slate-400 mb-1 sm:mb-2" />
                              <span className="text-[10px] sm:text-xs font-medium text-slate-500">Image {index + 1}</span>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageSelect(e, index)}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || images.filter(Boolean).length < 3 || !name}
                >
                  {isSubmitting ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                      Saving...
                    </>
                  ) : (
                    "Save Face Data"
                  )}
                </Button>
              </form>
            </Card>

            {/* Existing Faces Section - Now below Add New Face */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Existing Faces</h2>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : faces.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p>No faces have been trained yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2">
                  {faces.map((face) => (
                    <div
                      key={face.id}
                      className="flex flex-col p-3 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="flex items-center mb-3">
                        {face.imageUrls && face.imageUrls.length > 0 && (
                          <div className="h-12 w-12 rounded-full overflow-hidden border border-slate-200 mr-3">
                            <img
                              src={face.imageUrls[0]}
                              alt={face.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium text-slate-900">{face.name}</h3>
                          <p className="text-xs text-slate-500">{face.imageUrls?.length || 0} images</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewFace(face)}
                          className="flex-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFace(face.id)}
                          disabled={isDeleting === face.id}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          {isDeleting === face.id ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent"></span>
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}