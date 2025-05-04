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
import { CheckCircle, Upload, X, Trash2 } from "lucide-react"

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

  // Fetch faces from Firebase
  useEffect(() => {
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
  }, [])

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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <div className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Train Faces</h1>

        {isSubmitted ? (
          <Card className="p-8 text-center">
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
          <Card className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Person's Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Face Images (3 required)</Label>
                  <p className="text-sm text-slate-500 mb-4">
                    Upload 3 different images of the person's face for better recognition.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[0, 1, 2].map((index) => (
                      <div key={index} className="relative">
                        <div
                          className={`border-2 border-dashed rounded-lg p-4 h-48 flex flex-col items-center justify-center cursor-pointer ${imageUrls[index] ? 'border-green-500' : 'border-slate-300 hover:border-slate-400'
                            }`}
                          onClick={() => document.getElementById(`image-${index}`)?.click()}
                        >
                          {imageUrls[index] ? (
                            <div className="relative w-full h-full">
                              <img
                                src={imageUrls[index]}
                                alt={`Face ${index + 1}`}
                                className="w-full h-full object-cover rounded-md"
                              />
                              <button
                                type="button"
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeImage(index)
                                }}
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <Upload className="h-10 w-10 text-slate-400 mb-2" />
                              <p className="text-sm text-slate-500 text-center">
                                Click to upload image {index + 1}
                              </p>
                            </>
                          )}

                          {isSubmitting && uploadProgress[index] > 0 && uploadProgress[index] < 100 && (
                            <div className="absolute bottom-0 left-0 right-0 bg-slate-200 h-1">
                              <div
                                className="bg-green-500 h-1"
                                style={{ width: `${uploadProgress[index]}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                        <input
                          id={`image-${index}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageSelect(e, index)}
                          className="hidden"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Uploading..." : "Save Face Data"}
                </Button>
              </div>
            </form>
          </Card>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Trained Faces</h2>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-4 h-64 animate-pulse">
                  <div className="flex space-x-4">
                    <div className="w-16 h-16 bg-slate-200 rounded-full"></div>
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="h-24 bg-slate-200 rounded"></div>
                    <div className="h-24 bg-slate-200 rounded"></div>
                    <div className="h-24 bg-slate-200 rounded"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : faces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {faces.map((face) => (
                <Card key={face.id} className="p-4 overflow-hidden">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">{face.name}</h3>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteFace(face.id)}
                      disabled={isDeleting === face.id}
                    >
                      {isDeleting === face.id ? (
                        <span className="animate-pulse">Deleting...</span>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {face.imageUrls.map((url, index) => (
                      <div key={index} className="aspect-square rounded-md overflow-hidden">
                        <img
                          src={url}
                          alt={`${face.name} - ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-slate-500">No trained faces yet. Add some faces above.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}