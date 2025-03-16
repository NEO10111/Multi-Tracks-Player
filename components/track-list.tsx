"use client"

import { useState } from "react"
import type { Track } from "@/types/track"
import type { Playlist } from "@/types/playlist"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Repeat, Volume2, VolumeX, MoreHorizontal, Trash2, ListPlus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import TrackWaveform from "./track-waveform"

interface TrackListProps {
  tracks: Track[]
  playlists: Playlist[]
  togglePlayTrack: (trackId: string) => void
  toggleLoopTrack: (trackId: string) => void
  toggleMuteTrack: (trackId: string) => void
  updateTrackVolume: (trackId: string, volume: number) => void
  removeTrack: (trackId: string) => void
  seekTrack: (trackId: string, seekTime: number) => void
  formatTime: (seconds: number) => string
  addTrackToPlaylist: (trackId: string, playlistId: string) => void
  isPlaylistView?: boolean
}

export default function TrackList({
  tracks,
  playlists,
  togglePlayTrack,
  toggleLoopTrack,
  toggleMuteTrack,
  updateTrackVolume,
  removeTrack,
  seekTrack,
  formatTime,
  addTrackToPlaylist,
  isPlaylistView = false,
}: TrackListProps) {
  const [expandedTrackId, setExpandedTrackId] = useState<string | null>(null)

  // Toggle track expansion
  const toggleTrackExpansion = (trackId: string) => {
    setExpandedTrackId(expandedTrackId === trackId ? null : trackId)
  }

  return (
    <div className="p-4 space-y-3">
      {tracks.map((track) => (
        <div
          key={track.id}
          className={`bg-card rounded-lg overflow-hidden transition-all duration-300 border border-border ${
            track.isPlaying ? "shadow-md" : ""
          }`}
        >
          <div className="p-4">
            <div className="flex items-center justify-between gap-4 mb-3">
              {/* Play/Pause Button */}
              <Button
                onClick={() => togglePlayTrack(track.id)}
                variant="ghost"
                size="icon"
                className={`rounded-full ${track.isPlaying ? "bg-primary/10 text-primary" : ""}`}
              >
                {track.isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>

              {/* Track Info */}
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleTrackExpansion(track.id)}>
                <h3 className="text-sm font-medium truncate">{track.name}</h3>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <span>{formatTime(track.currentTime)}</span>
                  <span className="mx-1">/</span>
                  <span>{formatTime(track.duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => toggleLoopTrack(track.id)}
                  variant="ghost"
                  size="icon"
                  className={`rounded-full ${track.isLooping ? "text-primary" : "text-muted-foreground"}`}
                >
                  <Repeat className="w-4 h-4" />
                </Button>

                <Button
                  onClick={() => toggleMuteTrack(track.id)}
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-muted-foreground"
                >
                  {track.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Track Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {!isPlaylistView && (
                      <>
                        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                          Add to playlist
                        </DropdownMenuLabel>
                        {playlists.map((playlist) => (
                          <DropdownMenuItem key={playlist.id} onClick={() => addTrackToPlaylist(track.id, playlist.id)}>
                            <ListPlus className="w-4 h-4 mr-2" />
                            {playlist.name}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                      </>
                    )}

                    <DropdownMenuItem
                      onClick={() => removeTrack(track.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {isPlaylistView ? "Remove from playlist" : "Delete track"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Waveform */}
            <TrackWaveform track={track} seekTrack={seekTrack} />

            {/* Volume Slider - Always visible now */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-muted-foreground" />
                <Slider
                  value={[track.volume]}
                  max={1}
                  step={0.01}
                  onValueChange={(value) => updateTrackVolume(track.id, value[0])}
                  className="w-full"
                  disabled={track.isMuted}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

