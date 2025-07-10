import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useMusicStore } from "@/stores/useMusicStore";
import { Song } from "@/types";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Playlist } from "@/types";

export default function LibraryPage() {
    const { fetchSongs, songs, albums } = useMusicStore();
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [playlistTitle, setPlaylistTitle] = useState("");
    const [playlistDescription, setPlaylistDescription] = useState("");
    const [selectedSongs, setSelectedSongs] = useState<string[]>([]);
    const [message, setMessage] = useState("");
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchSongs();
        fetchPlaylists();
    }, []);

    const BACKEND_URL = "http://localhost:5000";

    const fetchPlaylists = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/playlists/me`, {
                credentials: "include", // if you're using cookies for auth
            });
            const data = await res.json();
            if (data.success) {
                setPlaylists(data.playlists);
            }
            else setMessage(data.message || "Failed to load playlists.");
        } catch (err) {
            console.error(err);
            setMessage("Error loading playlists.");
        }
    };

    const toggleSong = (id: string) => {
        setSelectedSongs(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const handleCreatePlaylist = async () => {
        if (!playlistTitle.trim() || selectedSongs.length === 0) {
            setMessage("Please enter a title and select at least one song.");
            return;
        }

        try {
            const res = await fetch(`${BACKEND_URL}/api/playlists/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    title: playlistTitle,
                    description: playlistDescription,
                    songIds: selectedSongs,
                }),
            });


            const data = await res.json();

            if (data.success) {
                setMessage("Playlist created successfully!");
                setPlaylistTitle("");
                setPlaylistDescription("");
                setSelectedSongs([]);
                setShowModal(false);
                fetchPlaylists();
            } else {
                setMessage(data.message || "Something went wrong.");
            }
        } catch (err) {
            console.error(err);
            setMessage("Failed to create playlist.");
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
        <div className="max-w-6xl mx-auto px-4 py-6"> {/* Adjusted max-width to match SearchPage/Explore */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Your Playlists</h1> {/* Increased font weight */}
                <Dialog open={showModal} onOpenChange={setShowModal}>
                    <DialogTrigger asChild>
                        <Button className="bg-white text-black hover:bg-black hover:text-white rounded-full px-6 py-3 text-lg"> {/* Styled button */}
                            Create Playlist
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl bg-zinc-900 border-zinc-700 text-white"> {/* Styled modal content */}
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-white">Create a New Playlist</DialogTitle> {/* Styled modal title */}
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
                                <div className="h-[300px] overflow-y-auto border border-zinc-700 rounded-md p-2 space-y-3 custom-scrollbar"> {/* Added custom-scrollbar class for styling */}
                                    {songs.length === 0 && (
                                        <p className="text-sm text-zinc-400">No songs available.</p>
                                    )}
                                    {songs.map((song: Song) => (
                                        <div
                                            key={song._id}
                                            className={cn(
                                                "flex items-center gap-3 bg-zinc-800/60 p-3 rounded-lg hover:bg-zinc-700/60 transition",
                                                selectedSongs.includes(song._id) && "border border-green-500" // Highlight selected songs
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
                                                <p className="text-xs text-zinc-400 truncate"> {/* Changed text-muted-foreground */}
                                                    {song.artist} • {getAlbumName(song.albumId)}
                                                </p>
                                            </div>
                                            <span className="text-xs text-zinc-500 whitespace-nowrap"> {/* Changed text-white/50 */}
                                                {formatDuration(song.duration)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {message && (
                                <div className="text-sm text-green-500 mt-2">{message}</div>
                            )}

                            <Button onClick={handleCreatePlaylist} className="w-full bg-green-600 text-white hover:bg-green-700 rounded-full py-3 text-lg"> {/* Styled button */}
                                Create Playlist
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Display Playlists - Themed Grid Layout */}
            {playlists.length === 0 ? (
                <div className="text-zinc-400 text-center italic mt-12"> {/* Styled empty state text */}
                    You haven’t created any playlists yet.
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"> {/* Matches explore grid */}
                    {playlists.map((playlist) => (
                        <Link
                            to={`/playlists/${playlist._id}`} // Link to individual playlist page
                            key={playlist._id}
                            className="group flex flex-col p-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors" // Matching card style
                        >
                            <div className="relative w-full aspect-square mb-3">
                                <img
                                    src={playlist.imageUrl || "https://via.placeholder.com/150/0000FF/FFFFFF?text=Playlist"} // Use playlist image or fallback
                                    alt={playlist.title}
                                    className="w-full h-full rounded-md object-cover shadow-lg group-hover:opacity-90 transition-opacity" // Image styling
                                />
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-medium text-white truncate">{playlist.title}</h3>
                                <p className="text-sm text-zinc-400 truncate">{playlist.description || "No description"}</p> {/* Show description or placeholder */}
                                <p className="text-xs text-zinc-500 mt-1"> {/* Styled song count */}
                                    {playlist.songs.length} song{playlist.songs.length !== 1 && "s"}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
