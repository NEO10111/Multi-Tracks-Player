"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import type { Track } from "@/types/track"
import type { Playlist } from "@/types/playlist"
import Header from "./header"
import TrackList from "./track-list"
import MasterControls from "./master-controls"
import PlaylistPanel from "./playlist-panel"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { PlusCircle, Music } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"

export default function AudioStudio() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([{ id: "default", name: "Default Playlist", trackIds: [] }])
  const [activePlaylistId, setActivePlaylistId] = useState("default")
  const [masterVolume, setMasterVolume] = useState(0.8)
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [isAllPlaying, setIsAllPlaying] = useState(false)
  const [activeTab, setActiveTab] = useState("tracks")

  const fileInputRef = useRef<HTMLInputElement>(null)
  const emptyStateFileInputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()
  const { theme } = useTheme()

  // Get tracks for active playlist
  const activePlaylistTracks = tracks.filter((track) =>
    playlists.find((p) => p.id === activePlaylistId)?.trackIds.includes(track.id),
  )

  // Handle file selection
  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File selection triggered", e.target.files)
    const files = e.target.files
    if (!files || files.length === 0) {
      console.log("No files selected")
      return
    }

    const newTracks: Track[] = []
    const newTrackIds: string[] = []

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("audio/")) {
        console.log("Processing audio file:", file.name)
        const audio = new Audio()
        audio.src = URL.createObjectURL(file)

        const trackId = Date.now() + Math.random().toString(36).substr(2, 5)

        const track: Track = {
          id: trackId,
          audio,
          file,
          name: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
          volume: 1,
          isPlaying: false,
          isLooping: false,
          isMuted: false,
          duration: 0,
          currentTime: 0,
          color: generateRandomColor(),
        }

        newTracks.push(track)
        newTrackIds.push(trackId)
      }
    })

    if (newTracks.length > 0) {
      console.log(`Adding ${newTracks.length} tracks`)
      setTracks((prev) => [...prev, ...newTracks])

      // Add new tracks to active playlist
      setPlaylists((prev) =>
        prev.map((playlist) =>
          playlist.id === activePlaylistId
            ? { ...playlist, trackIds: [...playlist.trackIds, ...newTrackIds] }
            : playlist,
        ),
      )

      toast({
        title: "Tracks added",
        description: `Added ${newTracks.length} new track${newTracks.length > 1 ? "s" : ""}`,
      })
    }

    // Reset file input
    e.target.value = ""
  }

  // Generate random color for track visualization
  const generateRandomColor = () => {
    const colors = [
      "rgb(239, 68, 68)", // red
      "rgb(249, 115, 22)", // orange
      "rgb(234, 179, 8)", // yellow
      "rgb(34, 197, 94)", // green
      "rgb(59, 130, 246)", // blue
      "rgb(168, 85, 247)", // purple
      "rgb(236, 72, 153)", // pink
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  // Update master volume
  const updateMasterVolume = (volume: number) => {
    setMasterVolume(volume)
  }

  // Toggle play/pause all tracks
  const togglePlayAll = () => {
    const shouldPlay = !isAllPlaying

    setIsAllPlaying(shouldPlay)

    const tracksToUpdate = activeTab === "playlists" ? activePlaylistTracks : tracks

    setTracks((prev) =>
      prev.map((track) => {
        if (tracksToUpdate.some((t) => t.id === track.id)) {
          if (shouldPlay) {
            track.audio.play().catch((error) => console.error("Error playing track:", error))
            return { ...track, isPlaying: true }
          } else {
            track.audio.pause()
            return { ...track, isPlaying: false }
          }
        }
        return track
      }),
    )
  }

  // Handle sleep timer change
  const handleSleepTimerChange = (seconds: number) => {
    if (seconds > 0) {
      setSleepTimer(seconds)
      toast({
        title: "Sleep timer set",
        description: `Music will stop in ${formatTime(seconds)}`,
      })
    } else {
      clearSleepTimer()
    }
  }

  // Set sleep timer
  const setSleepTimer = (seconds: number) => {
    clearSleepTimer()
    setSleepTimerRemaining(seconds)
    setTimerActive(true)
  }

  // Clear sleep timer
  const clearSleepTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setTimerActive(false)
  }

  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Update track volume
  const updateTrackVolume = (trackId: string, volume: number) => {
    setTracks((prev) =>
      prev.map((track) => {
        if (track.id === trackId) {
          track.audio.volume = track.isMuted ? 0 : volume * masterVolume
          return { ...track, volume }
        }
        return track
      }),
    )
  }

  // Toggle mute for a track
  const toggleMuteTrack = (trackId: string) => {
    setTracks((prev) =>
      prev.map((track) => {
        if (track.id === trackId) {
          const isMuted = !track.isMuted
          track.audio.volume = isMuted ? 0 : track.volume * masterVolume
          return { ...track, isMuted }
        }
        return track
      }),
    )
  }

  // Toggle play/pause for a track
  const togglePlayTrack = (trackId: string) => {
    setTracks((prev) => {
      const updatedTracks = prev.map((track) => {
        if (track.id === trackId) {
          if (track.isPlaying) {
            track.audio.pause()
            return { ...track, isPlaying: false }
          } else {
            track.audio.play().catch((error) => console.error("Error playing track:", error))
            return { ...track, isPlaying: true }
          }
        }
        return track
      })

      // Update isAllPlaying state based on whether all tracks are playing
      const relevantTracks =
        activeTab === "playlists"
          ? updatedTracks.filter((t) => playlists.find((p) => p.id === activePlaylistId)?.trackIds.includes(t.id))
          : updatedTracks

      const allPlaying = relevantTracks.length > 0 && relevantTracks.every((t) => t.isPlaying)
      setIsAllPlaying(allPlaying)

      return updatedTracks
    })
  }

  // Toggle loop for a track
  const toggleLoopTrack = (trackId: string) => {
    console.log("Toggling loop for track:", trackId)
    setTracks((prev) =>
      prev.map((track) => {
        if (track.id === trackId) {
          const newLoopState = !track.isLooping
          console.log(`Setting loop state to ${newLoopState} for track ${track.name}`)
          track.audio.loop = newLoopState
          return { ...track, isLooping: newLoopState }
        }
        return track
      }),
    )
  }

  // Remove a track
  const removeTrack = (trackId: string) => {
    setTracks((prev) => {
      const trackToRemove = prev.find((track) => track.id === trackId)
      if (trackToRemove) {
        trackToRemove.audio.pause()
        URL.revokeObjectURL(trackToRemove.audio.src)
      }
      return prev.filter((track) => track.id !== trackId)
    })

    // Remove track from all playlists
    setPlaylists((prev) =>
      prev.map((playlist) => ({
        ...playlist,
        trackIds: playlist.trackIds.filter((id) => id !== trackId),
      })),
    )

    toast({
      title: "Track removed",
      description: "The track has been removed from your library",
    })
  }

  // Seek track
  const seekTrack = (trackId: string, seekTime: number) => {
    setTracks((prev) =>
      prev.map((track) => {
        if (track.id === trackId) {
          track.audio.currentTime = seekTime
          return track
        }
        return track
      }),
    )
  }

  // Create a new playlist
  const createPlaylist = (name: string) => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      trackIds: [],
    }

    setPlaylists((prev) => [...prev, newPlaylist])
    setActivePlaylistId(newPlaylist.id)
    setActiveTab("playlists")

    toast({
      title: "Playlist created",
      description: `Created new playlist: ${name}`,
    })
  }

  // Add track to playlist
  const addTrackToPlaylist = (trackId: string, playlistId: string) => {
    setPlaylists((prev) =>
      prev.map((playlist) => {
        if (playlist.id === playlistId && !playlist.trackIds.includes(trackId)) {
          return { ...playlist, trackIds: [...playlist.trackIds, trackId] }
        }
        return playlist
      }),
    )

    toast({
      title: "Track added to playlist",
      description: `Added to ${playlists.find((p) => p.id === playlistId)?.name}`,
    })
  }

  // Remove track from playlist
  const removeTrackFromPlaylist = (trackId: string, playlistId: string) => {
    setPlaylists((prev) =>
      prev.map((playlist) => {
        if (playlist.id === playlistId) {
          return { ...playlist, trackIds: playlist.trackIds.filter((id) => id !== trackId) }
        }
        return playlist
      }),
    )
  }

  // Delete playlist
  const deletePlaylist = (playlistId: string) => {
    if (playlistId === "default") {
      toast({
        title: "Cannot delete default playlist",
        description: "The default playlist cannot be deleted",
        variant: "destructive",
      })
      return
    }

    setPlaylists((prev) => prev.filter((playlist) => playlist.id !== playlistId))

    if (activePlaylistId === playlistId) {
      setActivePlaylistId("default")
    }

    toast({
      title: "Playlist deleted",
      description: "The playlist has been removed",
    })
  }

  // Update track progress
  useEffect(() => {
    const updateTrackTimes = () => {
      setTracks((prev) =>
        prev.map((track) => {
          return {
            ...track,
            currentTime: track.audio.currentTime,
            duration: track.audio.duration || 0,
          }
        }),
      )
    }

    const interval = setInterval(updateTrackTimes, 250)
    return () => clearInterval(interval)
  }, [])

  // Apply master volume to all tracks
  useEffect(() => {
    tracks.forEach((track) => {
      track.audio.volume = track.isMuted ? 0 : track.volume * masterVolume
    })
  }, [masterVolume, tracks])

  // Sleep timer effect
  useEffect(() => {
    if (timerActive && sleepTimerRemaining > 0) {
      timerRef.current = setInterval(() => {
        setSleepTimerRemaining((prev) => {
          if (prev <= 1) {
            clearSleepTimer()
            // Pause all tracks
            setTracks((prev) =>
              prev.map((track) => {
                track.audio.pause()
                return { ...track, isPlaying: false }
              }),
            )
            setIsAllPlaying(false)

            toast({
              title: "Sleep timer ended",
              description: "All tracks have been paused",
            })

            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [timerActive, sleepTimerRemaining])

  // Clean up audio elements on unmount
  useEffect(() => {
    return () => {
      tracks.forEach((track) => {
        track.audio.pause()
        URL.revokeObjectURL(track.audio.src)
      })
    }
  }, [])

  // Check if any track is playing to update isAllPlaying
  useEffect(() => {
    const relevantTracks =
      activeTab === "playlists"
        ? tracks.filter((t) => playlists.find((p) => p.id === activePlaylistId)?.trackIds.includes(t.id))
        : tracks

    const allPlaying = relevantTracks.length > 0 && relevantTracks.every((t) => t.isPlaying)
    setIsAllPlaying(allPlaying)
  }, [tracks, activeTab, activePlaylistId, playlists])

  return (
    <div className="flex flex-col h-screen bg-background text-foreground transition-colors duration-300">
      <Header
        isAllPlaying={isAllPlaying}
        togglePlayAll={togglePlayAll}
        sleepTimerRemaining={sleepTimerRemaining}
        timerActive={timerActive}
        formatTime={formatTime}
      />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-64 lg:w-80 border-r border-border">
          <PlaylistPanel
            playlists={playlists}
            activePlaylistId={activePlaylistId}
            setActivePlaylistId={setActivePlaylistId}
            createPlaylist={createPlaylist}
            deletePlaylist={deletePlaylist}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
        </div>

        <div className="flex-1 flex flex-col overflow-scroll">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="px-4 pt-4 flex items-center justify-between border-b border-border">
              <TabsList>
                <TabsTrigger value="tracks">All Tracks</TabsTrigger>
                <TabsTrigger value="playlists">Playlists</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Tracks
                </Button>
                <input
                  type="file"
                  id="audio-file"
                  ref={fileInputRef}
                  accept="audio/*"
                  className="hidden"
                  multiple
                  onChange={handleFileSelection}
                />
              </div>
            </div>

            <TabsContent value="tracks" className="flex-1 overflow-auto">
              {tracks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <Music className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No tracks yet</h3>
                  <p className="text-muted-foreground mb-4">Add some audio tracks to get started</p>
                  <Button onClick={() => emptyStateFileInputRef.current?.click()}>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add Tracks
                  </Button>
                  <input
                    type="file"
                    id="audio-file-empty"
                    ref={emptyStateFileInputRef}
                    accept="audio/*"
                    className="hidden"
                    multiple
                    onChange={handleFileSelection}
                  />
                </div>
              ) : (
                <div className="h-full overflow-y-auto">
                  <TrackList
                    tracks={tracks}
                    playlists={playlists}
                    togglePlayTrack={togglePlayTrack}
                    toggleLoopTrack={toggleLoopTrack}
                    toggleMuteTrack={toggleMuteTrack}
                    updateTrackVolume={updateTrackVolume}
                    removeTrack={removeTrack}
                    seekTrack={seekTrack}
                    formatTime={formatTime}
                    addTrackToPlaylist={addTrackToPlaylist}
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="playlists" className="flex-1 overflow-auto">
              {activePlaylistTracks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <Music className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No tracks in this playlist</h3>
                  <p className="text-muted-foreground mb-4">Add tracks to this playlist to get started</p>
                </div>
              ) : (
                <div className="h-full overflow-y-auto">
                  <TrackList
                    tracks={activePlaylistTracks}
                    playlists={playlists}
                    togglePlayTrack={togglePlayTrack}
                    toggleLoopTrack={toggleLoopTrack}
                    toggleMuteTrack={toggleMuteTrack}
                    updateTrackVolume={updateTrackVolume}
                    removeTrack={(trackId) => removeTrackFromPlaylist(trackId, activePlaylistId)}
                    seekTrack={seekTrack}
                    formatTime={formatTime}
                    addTrackToPlaylist={addTrackToPlaylist}
                    isPlaylistView={true}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <MasterControls
        masterVolume={masterVolume}
        updateMasterVolume={updateMasterVolume}
        isAllPlaying={isAllPlaying}
        togglePlayAll={togglePlayAll}
        handleSleepTimerChange={handleSleepTimerChange}
        timerActive={timerActive}
        sleepTimerRemaining={sleepTimerRemaining}
        formatTime={formatTime}
        clearSleepTimer={clearSleepTimer}
      />

      <Toaster />
    </div>
  )
}

