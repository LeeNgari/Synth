import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListMusic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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

const PlaylistsTabContent = () => {
    const { fetchSongs, songs, albums } = useMusicStore();
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [playlistTitle, setPlaylistTitle] = useState("");
    const [playlistDescription, setPlaylistDescription] = useState("");
    const [selectedSongs, setSelectedSongs] = useState<string[]>([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchSongs();
        fetchPlaylists();
    }, []);

    const fetchPlaylists = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/playlists/public", {
                withCredentials: true
            });
            if (res.data.success) {
                setPlaylists(res.data.playlists);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const toggleSong = (id: string) => {
        setSelectedSongs(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const handleCreatePlaylist = async () => {
        if (!playlistTitle.trim() || selectedSongs.length === 0) {
            toast.error("Please enter a title and select at least one song.");
            return;
        }

        try {
            const res = await axios.post("http://localhost:5000/api/playlists/create", {
                title: playlistTitle,
                description: playlistDescription,
                songIds: selectedSongs,
                isPublic: true
            }, {
                withCredentials: true
            });

            if (res.data.success) {
                toast.success("Playlist created successfully!");
                setPlaylistTitle("");
                setPlaylistDescription("");
                setSelectedSongs([]);
                setShowModal(false);
                fetchPlaylists();
            } else {
                toast.error(res.data.message || "Something went wrong.");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to create playlist.");
        }
    };

    const getAlbumName = (albumId: string | null) => {
        const album = albums.find((a) => a._id === albumId);
        return album?.title || "Unknown Album";
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
        return `${mins}:${secs}`;
    };

    return (
        <Card className='bg-[#2e6f57]'>
            <CardHeader>
                <div className='flex items-center justify-between'>
                    <div>
                        <CardTitle className='flex items-center gap-2'>
                            <ListMusic className='text-white' />
                            Public Playlists
                        </CardTitle>
                        <CardDescription className="text-white">Manage public playlists</CardDescription>
                    </div>
                    <Dialog open={showModal} onOpenChange={setShowModal}>
                        <DialogTrigger asChild>
                            <Button className="bg-white text-black hover:bg-black hover:text-white rounded-full px-6 py-3 text-lg">Create Playlist</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl bg-zinc-900 border-zinc-700 text-white">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold text-white">Create a New Playlist</DialogTitle>
                            </DialogHeader>

                            <div className="grid gap-4 py-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="title" className="text-zinc-300">Playlist Title</Label>
                                    <Input
                                        id="title"
                                        value={playlistTitle}
                                        onChange={(e) => setPlaylistTitle(e.target.value)}
                                        placeholder="E.g. Gym Mix"
                                        className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:ring-green-500"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="description" className="text-zinc-300">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={playlistDescription}
                                        onChange={(e) => setPlaylistDescription(e.target.value)}
                                        placeholder="Optional description..."
                                        className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:ring-green-500"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label className="text-zinc-300">Select Songs</Label>
                                    <div className="h-[300px] overflow-y-auto border border-zinc-700 rounded-md p-2 space-y-3 custom-scrollbar">
                                        {songs.length === 0 && (
                                            <p className="text-sm text-zinc-400">No songs available.</p>
                                        )}
                                        {songs.map((song: Song) => (
                                            <div
                                                key={song._id}
                                                className={cn(
                                                    "flex items-center gap-3 bg-zinc-800/60 p-3 rounded-lg hover:bg-zinc-700/60 transition",
                                                    selectedSongs.includes(song._id) && "border border-green-500"
                                                )}
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
                                                    <p className="text-sm text-white truncate font-medium">
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

                                <Button onClick={handleCreatePlaylist} className="w-full bg-green-600 text-white hover:bg-green-700 rounded-full py-3 text-lg">Create Playlist</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {playlists.map((playlist) => (
                        <div key={playlist._id} className="group flex flex-col p-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors">
                            <div className="relative w-full aspect-square mb-3">
                                <img
                                    src={playlist.imageUrl || "https://via.placeholder.com/150/0000FF/FFFFFF?text=Playlist"}
                                    alt={playlist.title}
                                    className="w-full h-full rounded-md object-cover shadow-lg group-hover:opacity-90 transition-opacity"
                                />
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-medium text-white truncate">{playlist.title}</h3>
                                <p className="text-sm text-zinc-400 truncate">{playlist.description || "No description"}</p>
                                <p className="text-xs text-zinc-500 mt-1">
                                    {playlist.songs.length} song{playlist.songs.length !== 1 && "s"}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default PlaylistsTabContent;
