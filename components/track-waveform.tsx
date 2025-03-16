"use client"

import type React from "react"

import { useRef, useEffect } from "react"
import type { Track } from "@/types/track"

interface TrackWaveformProps {
  track: Track
  seekTrack: (trackId: string, seekTime: number) => void
}

export default function TrackWaveform({ track, seekTrack }: TrackWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Handle click on waveform to seek
  const handleWaveformClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const seekPercentage = clickX / rect.width
    const seekTime = track.duration * seekPercentage

    seekTrack(track.id, seekTime)
  }

  // Draw waveform
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Generate pseudo-random waveform based on track id (for visualization)
    const waveformHeight = rect.height
    const waveformWidth = rect.width
    const numBars = 100
    const barWidth = waveformWidth / numBars
    const barSpacing = 1
    const maxBarHeight = waveformHeight * 0.8

    // Use track id as seed for pseudo-random generation
    const seed = track.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)

    // Draw background bars
    ctx.fillStyle = "rgba(100, 100, 100, 0.2)"

    for (let i = 0; i < numBars; i++) {
      // Generate height based on position and seed
      const heightFactor = Math.sin((i / numBars) * Math.PI) * (0.5 + 0.5 * Math.sin((i * seed) % 10))
      const barHeight = maxBarHeight * heightFactor

      ctx.fillRect(i * (barWidth + barSpacing), (waveformHeight - barHeight) / 2, barWidth, barHeight)
    }

    // Draw progress bars
    const progressWidth = (track.currentTime / track.duration) * waveformWidth
    ctx.fillStyle = track.color || "rgb(99, 102, 241)"

    for (let i = 0; i < numBars; i++) {
      const barX = i * (barWidth + barSpacing)
      if (barX > progressWidth) break

      // Generate height based on position and seed
      const heightFactor = Math.sin((i / numBars) * Math.PI) * (0.5 + 0.5 * Math.sin((i * seed) % 10))
      const barHeight = maxBarHeight * heightFactor

      ctx.fillRect(barX, (waveformHeight - barHeight) / 2, barWidth, barHeight)
    }
  }, [track.currentTime, track.duration, track.id, track.color])

  return (
    <div className="mt-2 cursor-pointer">
      <canvas ref={canvasRef} height={40} className="w-full rounded" onClick={handleWaveformClick} />
    </div>
  )
}

