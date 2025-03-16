"use client"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Volume2, Clock, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MasterControlsProps {
  masterVolume: number
  updateMasterVolume: (volume: number) => void
  isAllPlaying: boolean
  togglePlayAll: () => void
  handleSleepTimerChange: (seconds: number) => void
  timerActive: boolean
  sleepTimerRemaining: number
  formatTime: (seconds: number) => string
  clearSleepTimer: () => void
}

export default function MasterControls({
  masterVolume,
  updateMasterVolume,
  isAllPlaying,
  togglePlayAll,
  handleSleepTimerChange,
  timerActive,
  sleepTimerRemaining,
  formatTime,
  clearSleepTimer,
}: MasterControlsProps) {
  return (
    <div className="border-t border-border p-4 bg-card">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button onClick={togglePlayAll} variant="default" size="icon" className="rounded-full h-10 w-10">
            {isAllPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>

          <div className="flex items-center gap-2 w-40">
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <Slider
              value={[masterVolume]}
              max={1}
              step={0.01}
              onValueChange={(value) => updateMasterVolume(value[0])}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {timerActive ? (
            <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">{formatTime(sleepTimerRemaining)}</span>
              <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full p-0" onClick={clearSleepTimer}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <Select onValueChange={(value) => handleSleepTimerChange(Number.parseInt(value))}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sleep Timer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">No Timer</SelectItem>
                <SelectItem value="300">5 Minutes</SelectItem>
                <SelectItem value="600">10 Minutes</SelectItem>
                <SelectItem value="1800">30 Minutes</SelectItem>
                <SelectItem value="3600">1 Hour</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </div>
  )
}

