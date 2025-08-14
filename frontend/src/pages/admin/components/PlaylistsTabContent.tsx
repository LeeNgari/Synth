
import { ListMusic } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useMusicStore } from "@/stores/useMusicStore";
import { Song } from "@/types";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const PlaylistsTabContent = () => {
  const { fetchSongs, songs, albums } = useMusicStore();
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [playlistTitle, setPlaylistTitle] = useState("");
  const [playlistDescription, setPlaylistDescription] = useState("");
  const [selectedSongs, setSelectedSongs] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentPlaylistToEdit, setCurrentPlaylistToEdit] = useState<any>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSelectedSongs, setEditSelectedSongs] = useState<string[]>([]);

  useEffect(() => {
    fetchSongs(); // Fetch all songs for selection
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/playlists/public",
        {
          withCredentials: true,
        },
      );
      if (res.data.success) {
        setPlaylists(res.data.playlists);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch public playlists.");
    }
  };

  const toggleSong = (id: string) => {
    setSelectedSongs((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const toggleEditSong = (id: string) => {
    setEditSelectedSongs((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handleCreatePlaylist = async () => {
    if (!playlistTitle.trim() || selectedSongs.length === 0) {
      toast.error("Please enter a title and select at least one song.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/playlists/create",
        {
          title: playlistTitle,
          description: playlistDescription,
          songIds: selectedSongs,
          isPublic: true,
        },
        {
          withCredentials: true,
        },
      );

      if (res.data.success) {
        toast.success("Playlist created successfully!");
        setPlaylistTitle("");
        setPlaylistDescription("");
        setSelectedSongs([]);
        setShowCreateModal(false);
        fetchPlaylists();
      } else {
        toast.error(res.data.message || "Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to create playlist.");
    }
  };

  const handleEditClick = (playlist: any) => {
    setCurrentPlaylistToEdit(playlist);
    setEditTitle(playlist.title);
    setEditDescription(playlist.description || "");
    setEditSelectedSongs(playlist.songs.map((s: any) => s._id)); // Initialize with current songs
    setShowEditDialog(true);
  };

  const handleUpdatePlaylist = async () => {
    if (!currentPlaylistToEdit || !editTitle.trim()) {
      toast.error("Title cannot be empty.");
      return;
    }
    try {
      const response = await axios.put(
        `http://localhost:5000/api/playlists/${currentPlaylistToEdit._id}`,
        { title: editTitle, description: editDescription, songIds: editSelectedSongs },
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success("Playlist updated!");
        fetchPlaylists(); // Refresh data
        setShowEditDialog(false);
      }
    } catch (error) {
      toast.error("Failed to update playlist.");
      console.error(error);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!currentPlaylistToEdit) return;
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/playlists/${currentPlaylistToEdit._id}`,
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success("Playlist deleted.");
        fetchPlaylists(); // Refresh data
        setShowDeleteDialog(false);
      }
    } catch (error) {
      toast.error("Failed to delete playlist.");
      console.error(error);
    }
  };

  const getAlbumName = (albumId: string | null) => {
    const album = albums.find((a) => a._id === albumId);
    return album?.title || "Unknown Album";
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ListMusic className="text-white" />
            Public Playlists
          </h2>
          <p className="text-white">Manage public playlists</p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button className="bg-white text-black hover:bg-black hover:text-white rounded-full px-6 py-3 text-lg font-semibold transition-colors">
              Create Playlist
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-3xl bg-zinc-900 border border-zinc-800 text-white rounded-2xl shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                Create a New Playlist
              </DialogTitle>
              <p className="text-sm text-zinc-400">
                Fill in details and pick songs to include
              </p>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              {/* Playlist Title */}
              <div className="grid gap-2">
                <Label htmlFor="title" className="text-zinc-300">
                  Playlist Title
                </Label>
                <Input
                  id="title"
                  value={playlistTitle}
                  onChange={(e) => setPlaylistTitle(e.target.value)}
                  placeholder="E.g. Gym Mix" 
                  className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:border-green-500 focus:ring-green-500 rounded-lg"
                />
              </div>

              {/* Description */}
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-zinc-300">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={playlistDescription}
                  onChange={(e) => setPlaylistDescription(e.target.value)}
                  placeholder="Optional description..."
                  className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:border-green-500 focus:ring-green-500 rounded-lg"
                />
              </div>

              {/* Song List */}
              <div className="grid gap-2">
                <Label className="text-zinc-300">Select Songs</Label>
                <div className="h-[300px] overflow-y-auto border border-zinc-700 rounded-lg p-3 space-y-3 custom-scrollbar">
                  {songs.length === 0 && (
                    <p className="text-sm text-zinc-500">No songs available.</p>
                  )}

                  {songs.map((song: Song) => (
                    <div
                      key={song._id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/70 transition-colors cursor-pointer",
                        selectedSongs.includes(song._id) &&
                          "border border-green-500 bg-green-500/10",
                      )}
                      onClick={() => toggleSong(song._id)}
                    >
                      <Checkbox
                        id={song._id}
                        checked={selectedSongs.includes(song._id)}
                        onCheckedChange={() => toggleSong(song._id)}
                        className="border-zinc-500 data-[state=checked]:bg-green-600 data-[state=checked]:text-white"
                      />
                      <img
                        src={song.imageUrl}
                        alt={song.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium text-white truncate">
                          {song.title}
                        </p>
                        <p className="text-xs text-zinc-400 truncate">
                          {song.artist} • {getAlbumName(song.albumId)}
                        </p>
                      </div>
                      <span className="text-xs text-zinc-500 whitespace-nowrap">
                        {formatDuration(song.duration)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <Button
                onClick={handleCreatePlaylist}
                className="w-full bg-green-600 text-white hover:bg-green-700 rounded-full py-3 text-lg font-semibold transition-colors"
              >
                Create Playlist
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {playlists.map((playlist) => (
          <div
            key={playlist._id}
            className="group flex flex-col p-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
          >
            <div className="relative w-full aspect-square mb-3">
              <img
                src={
                  playlist.imageUrl ||
                  "https://via.placeholder.com/150/0000FF/FFFFFF?text=Playlist"
                }
                alt={playlist.title}
                className="w-full h-full rounded-md object-cover shadow-lg group-hover:opacity-90 transition-opacity"
              />
            </div>
            <div className="min-w-0">
              <h3 className="font-medium text-white truncate">
                {playlist.title}
              </h3>
              <p className="text-sm text-zinc-400 truncate">
                {playlist.description || "No description"}
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                {playlist.songs.length} song{playlist.songs.length !== 1 && "s"}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-white/50 hover:text-white"
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-zinc-800 border-zinc-700 text-white">
                <DropdownMenuItem
                  onSelect={() => handleEditClick(playlist)}
                  className="hover:bg-zinc-700 cursor-pointer flex items-center gap-2"
                >
                  <Pencil className="size-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    setCurrentPlaylistToEdit(playlist);
                    setShowDeleteDialog(true);
                  }}
                  className="hover:bg-zinc-700 cursor-pointer flex items-center gap-2 text-red-500 hover:text-red-400"
                >
                  <Trash2 className="size-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Edit Playlist</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              id="editTitle"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Playlist Title"
              className="bg-zinc-800 border-zinc-700"
            />
            <Textarea
              id="editDescription"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Description"
              className="bg-zinc-800 border-zinc-700"
            />
          </div>
          <DialogFooter>
            <Button onClick={() => setShowEditDialog(false)} variant="ghost">
              Cancel
            </Button>
            <Button onClick={handleUpdatePlaylist} className="bg-green-600 hover:bg-green-700">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Delete Playlist</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete "{currentPlaylistToEdit?.title}"? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button onClick={() => setShowDeleteDialog(false)} variant="ghost">
              Cancel
            </Button>
            <Button onClick={handleDeletePlaylist} variant="destructive">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlaylistsTabContent;
