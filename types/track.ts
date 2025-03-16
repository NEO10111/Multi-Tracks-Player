export interface Track {
  id: string
  audio: HTMLAudioElement
  file: File
  name: string
  volume: number
  isPlaying: boolean
  isLooping: boolean
  isMuted: boolean
  duration: number
  currentTime: number
  color?: string
}

