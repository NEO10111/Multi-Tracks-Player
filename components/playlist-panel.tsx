"use client"

import { useState } from "react"
import type { Playlist } from "@/types/playlist"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ListMusic, PlusCircle, Trash2, Music } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface PlaylistPanelProps {
  playlists: Playlist[]
  activePlaylistId: string
  setActivePlaylistId: (id: string) => void
  createPlaylist: (name: string) => void
  deletePlaylist: (id: string) => void
  setActiveTab: (tab: string) => void
  activeTab: string
}

export default function PlaylistPanel({
  playlists,
  activePlaylistId,
  setActivePlaylistId,
  createPlaylist,
  deletePlaylist,
  setActiveTab,
  activeTab,
}: PlaylistPanelProps) {
  const [newPlaylistName, setNewPlaylistName] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim())
      setNewPlaylistName("")
      setIsDialogOpen(false)
    }
  }

  const handleSelectPlaylist = (id: string) => {
    setActivePlaylistId(id)
    setActiveTab("playlists")
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-medium">Playlists</h2>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <PlusCircle className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Playlist</DialogTitle>
              <DialogDescription>Give your playlist a name to help you organize your tracks.</DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <Input
                placeholder="Playlist name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreatePlaylist()
                  }
                }}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePlaylist}>Create Playlist</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          <Button
            variant="ghost"
            className={`w-full justify-start mb-1 ${activeTab === "tracks" ? "bg-accent text-accent-foreground" : ""}`}
            onClick={() => setActiveTab("tracks")}
          >
            <Music className="w-4 h-4 mr-2" />
            All Tracks
          </Button>

          {playlists.map((playlist) => (
            <div key={playlist.id} className="flex items-center group">
              <Button
                variant="ghost"
                className={`w-full justify-start ${
                  activePlaylistId === playlist.id && activeTab === "playlists"
                    ? "bg-accent text-accent-foreground"
                    : ""
                }`}
                onClick={() => handleSelectPlaylist(playlist.id)}
              >
                <ListMusic className="w-4 h-4 mr-2" />
                <span className="truncate">{playlist.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">{playlist.trackIds.length}</span>
              </Button>

              {playlist.id !== "default" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => deletePlaylist(playlist.id)}
                >
                  <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

