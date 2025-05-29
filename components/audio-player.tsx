import { useState, useRef, useEffect } from "react"

interface AudioPlayerProps {
  className?: string
}

export default function AudioPlayer({ className }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
    }
  }, [])

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const handleSpotifyRedirect = () => {
    window.location.href = 'https://open.spotify.com/track/4cktbXiXOapiLBMprHFErI?si=ea78e64dc4d54b59'
  }

  return (
    <div className={`w-full ${className || ''}`}>
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-pink-900 text-white shadow-2xl h-24 sm:h-32 md:h-36 lg:h-40 max-h-48">
        <div className="h-full flex items-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">



          {/* Album art */}
          <div className="flex-shrink-0 mr-3 sm:mr-4 lg:mr-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-lg overflow-hidden shadow-lg">
              <img
                src="poster-music.jpeg"
                alt="Memories - Maroon 5"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Song info */}
          <div className="flex-grow min-w-0 mr-3 sm:mr-4">
            <p className="text-xs sm:text-sm font-medium text-red-200 mb-0.5 sm:mb-1">Preview</p>
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-0.5 sm:mb-1 truncate">Memories</h1>
            <p className="text-sm sm:text-base md:text-lg text-red-200 truncate">Maroon 5</p>
          </div>

          {/* Save button - star icon only on mobile, with text on larger screens */}
          <div className="flex items-center mr-3 sm:mr-4 lg:mr-6">
            <button
              onClick={handleSpotifyRedirect}
              className="flex items-center gap-2 text-white hover:text-green-400 transition-colors"
            >
              <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full border-2 border-current flex items-center justify-center">
                <svg className="w-3 h-3 lg:w-4 lg:h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <span className="hidden md:inline text-sm lg:text-base font-medium whitespace-nowrap">Save on Spotify</span>
            </button>
          </div>

          {/* Player controls */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            {/* More options */}
            <button className="text-white hover:text-red-200 transition-colors">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>

            {/* Play button */}
            <button
              onClick={togglePlayPause}
              className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full bg-green-500 hover:bg-green-400 flex items-center justify-center text-black transition-all hover:scale-105 shadow-lg flex-shrink-0"
            >
              {isPlaying ? (
                <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 fill-current" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 fill-current ml-0.5" viewBox="0 0 24 24">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              )}
            </button>
          </div>

        </div>

        {/* Audio element (hidden) */}
        <audio
          ref={audioRef}
          src="https://audio.jukehost.co.uk/HSToSyMZ96GrJ4JreBmU6weUZpgVm0QQ"
          preload="metadata"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      </div>
    </div>
  )
}