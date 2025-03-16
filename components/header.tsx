"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MoonIcon, SunIcon, PlayIcon, PauseIcon, Clock } from "lucide-react"
import { useTheme } from "next-themes"

interface HeaderProps {
  isAllPlaying: boolean
  togglePlayAll: () => void
  sleepTimerRemaining: number
  timerActive: boolean
  formatTime: (seconds: number) => string
}

export default function Header({
  isAllPlaying,
  togglePlayAll,
  sleepTimerRemaining,
  timerActive,
  formatTime,
}: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // After mounting, we can safely show the UI
  useEffect(() => {
    setMounted(true)
  }, [])

  // Toggle theme function
  const toggleTheme = () => {
    console.log("Current theme:", theme)
    // Force the theme to the opposite of the current theme
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    console.log("Setting theme to:", newTheme)

    // Apply the theme class directly to the document element for immediate feedback
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  if (!mounted) {
    return (
      <div className="h-16 border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">Audio Studio Pro</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Placeholder for theme toggle */}
          <div className="w-9 h-9"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-16 border-b border-border flex items-center justify-between px-4">
      <div className="flex items-center">
        <h1 className="text-xl font-bold">Audio Studio Pro</h1>
      </div>

      <div className="flex items-center gap-2">
        {timerActive && (
          <div className="flex items-center text-sm font-medium text-primary mr-2">
            <Clock className="w-4 h-4 mr-1" />
            <span>{formatTime(sleepTimerRemaining)}</span>
          </div>
        )}

        <Button variant="outline" size="icon" onClick={togglePlayAll} className="rounded-full">
          {isAllPlaying ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
        </Button>

        <Button variant="outline" size="icon" onClick={toggleTheme} className="rounded-full">
          {theme === "dark" ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}

