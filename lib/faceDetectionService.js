import * as faceapi from 'face-api.js';
import { getDatabase, ref, update } from "firebase/database";

// Path to the models
const MODEL_URL = '/models';

// Flag to track if models are loaded
let modelsLoaded = false;

// Function to load models
export const loadModels = async () => {
  if (modelsLoaded) return;

  try {
    // Make sure we're in the browser environment
    if (typeof window === 'undefined') return;

    console.log('Loading face detection models...');

    // Load all required models - adding more models for better accuracy
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL), // Add SSD MobileNet for better detection
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL) // Optional: adds expression detection
    ]);

    modelsLoaded = true;
    console.log('Face detection models loaded successfully');
  } catch (error) {
    console.error('Error loading face detection models:', error);
  }
};

// Function to detect faces in an image
export const detectFaces = async (imageUrl, knownFaces) => {
  if (!modelsLoaded) {
    await loadModels();
  }

  try {
    // Create an HTML image element
    const img = await createImageElement(imageUrl);

    // Try multiple detection methods for better accuracy
    let detections;

    // First try with SSD MobileNet (more accurate but slower)
    try {
      detections = await faceapi.detectAllFaces(
        img,
        new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 })
      )
        .withFaceLandmarks()
        .withFaceDescriptors();
    } catch (e) {
      console.log('SSD MobileNet detection failed, falling back to TinyFaceDetector');
    }

    // If SSD MobileNet fails or finds no faces, try with TinyFaceDetector
    if (!detections || detections.length === 0) {
      detections = await faceapi.detectAllFaces(
        img,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 416, // Increase from default 416
          scoreThreshold: 0.4 // Lower threshold to detect more faces
        })
      )
        .withFaceLandmarks()
        .withFaceDescriptors();
    }

    // If still no faces detected, return empty array
    if (!detections || detections.length === 0) {
      console.log('No faces detected in image');
      return { detectedFaces: [] };
    }

    console.log(`Detected ${detections.length} faces in image`);

    // Match detected faces with known faces
    const labeledDescriptors = await createLabeledDescriptors(knownFaces);

    if (labeledDescriptors.length > 0) {
      // Adjust the distance threshold for better matching (0.5-0.6 is a good range)
      const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.55);

      // Map detections to include name and match data
      const results = detections.map(detection => {
        const match = faceMatcher.findBestMatch(detection.descriptor);
        return {
          detection: {
            box: detection.detection.box,
            score: detection.detection.score
          },
          landmarks: detection.landmarks.positions,
          name: match.label !== 'unknown' ? match.label : null,
          confidence: match.label !== 'unknown' ? (1 - match.distance).toFixed(2) : null,
          distance: match.distance
        };
      });

      return { detectedFaces: results };
    }

    // Return basic detection data if no known faces to match against
    return {
      detectedFaces: detections.map(detection => ({
        detection: {
          box: detection.detection.box,
          score: detection.detection.score
        },
        landmarks: detection.landmarks.positions,
        name: null,
        distance: null
      }))
    };

  } catch (error) {
    console.error('Error detecting faces:', error);
    return { detectedFaces: [], error: error.message };
  }
};

// Helper function to create an image element from URL with better error handling
const createImageElement = (url) => {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error('Invalid image URL'));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    // Add timeout to prevent hanging on image load
    const timeoutId = setTimeout(() => {
      reject(new Error('Image loading timeout'));
    }, 15000); // 15 second timeout

    img.onload = () => {
      clearTimeout(timeoutId);

      // Check if image has valid dimensions
      if (img.width === 0 || img.height === 0) {
        reject(new Error('Image has invalid dimensions'));
        return;
      }

      resolve(img);
    };

    img.onerror = (error) => {
      clearTimeout(timeoutId);
      reject(error || new Error('Error loading image'));
    };

    img.src = url;
  });
};

// Helper function to create labeled descriptors from known faces
const createLabeledDescriptors = async (knownFaces) => {
  if (!knownFaces || Object.keys(knownFaces).length === 0) {
    return [];
  }

  const labeledDescriptors = [];

  for (const faceId in knownFaces) {
    const face = knownFaces[faceId];
    const descriptors = [];

    // Process each image URL for this face
    for (const imageUrl of face.imageUrls) {
      try {
        const img = await createImageElement(imageUrl);

        // Try both detection methods for better accuracy
        let detection;

        // First try with SSD MobileNet
        try {
          detection = await faceapi.detectSingleFace(img, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
            .withFaceLandmarks()
            .withFaceDescriptor();
        } catch (e) {
          console.log('SSD MobileNet detection failed for known face, trying TinyFaceDetector');
        }

        // If SSD MobileNet fails, try with TinyFaceDetector
        if (!detection) {
          detection = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({
            inputSize: 416,
            scoreThreshold: 0.4
          }))
            .withFaceLandmarks()
            .withFaceDescriptor();
        }

        if (detection) {
          descriptors.push(detection.descriptor);
        } else {
          console.warn(`No face detected in known face image: ${imageUrl}`);
        }
      } catch (error) {
        console.error(`Error processing known face image: ${imageUrl}`, error);
      }
    }

    if (descriptors.length > 0) {
      labeledDescriptors.push(
        new faceapi.LabeledFaceDescriptors(face.name, descriptors)
      );
    } else {
      console.warn(`No valid descriptors found for face: ${face.name}`);
    }
  }

  return labeledDescriptors;
};

// Function to save detected faces to Firebase
export const saveDetectedFaces = async (imageId, detectedFaces) => {
  try {
    const db = getDatabase();

    // Extract only name and confidence (distance) for each face
    const simplifiedFaces = detectedFaces.map(face => {
      return {
        detection: face.detection, // Keep detection box data
        name: face.name,
        confidence: face.confidence || (face.distance !== null ? (1 - face.distance).toFixed(2) : null)
      };
    }).filter(face => face.detection); // Only store faces that were detected

    const updates = {};
    updates[`images/${imageId}/detectedFaces`] = simplifiedFaces;

    await update(ref(db), updates);
    console.log('Detected faces saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving detected faces:', error);
    return false;
  }
};