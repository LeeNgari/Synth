import { ScrollArea } from "@/components/ui/scroll-area";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Clock, Pause, Play, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import axios from "axios";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const PlaylistPage = () => {
    const { playlistId } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuthStore();
    const { fetchPlaylistById, currentPlaylist, playlistSongs, isLoading, fetchSongsByIds, songs: allSongs, fetchSongs } = useMusicStore();
    const { currentSong, isPlaying, playAlbum, togglePlay } = usePlayerStore();

    const [isOwner, setIsOwner] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [selectedSongs, setSelectedSongs] = useState<string[]>([]);

    useEffect(() => {
        fetchSongs(); // Fetch all songs for selection
        if (playlistId) {
            fetchPlaylistById(playlistId);
        }
    }, [playlistId, fetchPlaylistById, fetchSongs]);

    useEffect(() => {
        if (currentPlaylist) {
            if (currentPlaylist.songs?.length) {
                fetchSongsByIds(currentPlaylist.songs.map(s => typeof s === 'string' ? s : s._id));
                setSelectedSongs(currentPlaylist.songs.map(s => typeof s === 'string' ? s : s._id));
            }
            setEditTitle(currentPlaylist.title);
            setEditDescription(currentPlaylist.description || "");
            if (currentUser && currentPlaylist.createdBy) {
                const createdById = typeof currentPlaylist.createdBy === 'string' ? currentPlaylist.createdBy : currentPlaylist.createdBy._id;
                setIsOwner(currentUser._id === createdById || currentUser.role === 'admin');
            }
        }
    }, [currentPlaylist, currentUser, fetchSongsByIds]);

    const toggleSongSelection = (songId: string) => {
        setSelectedSongs(prev =>
            prev.includes(songId) ? prev.filter(s => s !== songId) : [...prev, songId]
        );
    };

    const handleUpdatePlaylist = async () => {
        if (!playlistId || !editTitle.trim()) {
            toast.error("Title cannot be empty.");
            return;
        }
        try {
            const response = await axios.put(`http://localhost:5000/api/playlists/${playlistId}`, 
                { title: editTitle, description: editDescription, songIds: selectedSongs }, 
                { withCredentials: true }
            );
            if (response.data.success) {
                toast.success("Playlist updated!");
                fetchPlaylistById(playlistId); // Refresh data
                setShowEditDialog(false);
            }
        } catch (error) {
            toast.error("Failed to update playlist.");
            console.error(error);
        }
    };

    const handleDeletePlaylist = async () => {
        if (!playlistId) return;
        try {
            const response = await axios.delete(`http://localhost:5000/api/playlists/${playlistId}`, { withCredentials: true });
            if (response.data.success) {
                toast.success("Playlist deleted.");
                navigate("/library");
            }
        } catch (error) {
            toast.error("Failed to delete playlist.");
            console.error(error);
        }
    };

    if (isLoading || !currentPlaylist) return <div>Loading...</div>; // Or a skeleton loader

    const handlePlayPlaylist = () => {
        if (!playlistSongs.length) return;
        const isCurrentPlaylistPlaying = playlistSongs.some((song) => song._id === currentSong?._id);
        if (isCurrentPlaylistPlaying) togglePlay();
        else playAlbum(playlistSongs, 0);
    };

    const handlePlaySong = (index: number) => {
        if (!playlistSongs.length) return;
        playAlbum(playlistSongs, index);
    };

    return (
        <div className='h-full bg-[#2e6f57]'>
            <ScrollArea className='h-full'>
                <div className='relative pt-8 pb-6 px-8'>
                    <div className='absolute inset-0 bg-gradient-to-b from-[#2e6f57]/50 to-transparent pointer-events-none' />
                    <div className='relative z-10 flex flex-col md:flex-row gap-6 items-end'>
                        <img src={currentPlaylist.imageUrl} alt={currentPlaylist.title} className='w-48 h-48 md:w-60 md:h-60 lg:w-72 lg:h-72 shadow-lg rounded-xl border-2 border-[#2e6f57]/50 object-cover' />
                        <div className='flex-1 space-y-4'>
                            <p className='text-sm font-semibold text-white'>PLAYLIST</p>
                            <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold text-white'>{currentPlaylist.title}</h1>
                            {currentPlaylist.description && <p className='text-zinc-300 max-w-xl'>{currentPlaylist.description}</p>}
                            <div className='flex items-center gap-2 text-sm text-zinc-300'>
                                <span>{playlistSongs.length} songs</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='px-8 pb-6 flex items-center gap-4'>
                    <button onClick={handlePlayPlaylist} className='flex items-center justify-center size-14 rounded-full bg-[#2e6f57] hover:bg-[#3a8c6e] transition-all shadow-lg hover:scale-105 active:scale-95'>
                        {isPlaying && playlistSongs.some((s) => s._id === currentSong?._id) ? <Pause className='h-6 w-6 text-white' /> : <Play className='h-6 w-6 text-white' />}
                    </button>
                    {isOwner && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="p-2 text-zinc-400 hover:text-white"><MoreVertical className="size-6" /></button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-zinc-800 border-zinc-700 text-white">
                                <DropdownMenuItem onSelect={() => setShowEditDialog(true)} className="hover:bg-zinc-700 cursor-pointer flex items-center gap-2"><Pencil className="size-4"/> Edit Details</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => setShowDeleteDialog(true)} className="hover:bg-zinc-700 cursor-pointer flex items-center gap-2 text-red-500 hover:text-red-400"><Trash2 className="size-4"/> Delete Playlist</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                {/* Songs Table */}
                <div className='px-4 pb-8'>
                    <div className='grid grid-cols-[16px_4fr_2fr_1fr] gap-4 px-6 py-3 text-sm text-zinc-400 border-b border-zinc-800'>
                        <div className='text-center'>#</div><div>TITLE</div><div>ARTIST</div><div className='flex justify-end pr-4'><Clock className='h-4 w-4' /></div>
                    </div>
                    <div className='divide-y divide-zinc-800/50'>
                        {playlistSongs.map((song, index) => {
                            const isCurrentSong = currentSong?._id === song._id;
                            return (
                                <div key={song._id} onClick={() => handlePlaySong(index)} className={`grid grid-cols-[16px_4fr_2fr_1fr] gap-4 px-6 py-3 text-sm hover:bg-[#2e6f57]/30 rounded-md group cursor-pointer transition-colors ${isCurrentSong ? "text-white bg-[#2e6f57]/20" : "text-white"}`}>
                                    <div className='flex items-center justify-center'>
                                        {isCurrentSong && isPlaying ? (
                                            <div className='size-4 flex items-center justify-center'><div className='w-1 h-3 bg-white mx-[1px] animate-pulse' /><div className='w-1 h-4 bg-white mx-[1px] animate-pulse' /><div className='w-1 h-2 bg-white mx-[1px] animate-pulse' /></div>
                                        ) : (
                                            <><span className='group-hover:hidden text-zinc-400'>{index + 1}</span><Play className='h-3 w-3 hidden group-hover:block text-white' /></>
                                        )}
                                    </div>
                                    <div className='flex items-center gap-4'>
                                        <img src={song.imageUrl} alt={song.title} className='size-10 rounded-sm object-cover border border-zinc-700/30' />
                                        <div><div className='font-medium text-white'>{song.title}</div></div>
                                    </div>
                                    <div className='flex items-center text-zinc-300'>{song.artist}</div>
                                    <div className='flex items-center justify-end pr-4 text-zinc-300'>{formatDuration(song.duration)}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </ScrollArea>

            {/* Edit Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-3xl">
                    <DialogHeader><DialogTitle>Edit Playlist</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Input id="title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Playlist Title" className="bg-zinc-800 border-zinc-700"/>
                        <Textarea id="description" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Description" className="bg-zinc-800 border-zinc-700"/>
                        
                        <div className="grid gap-2">
                            <h3 className="text-zinc-300">Select Songs</h3>
                            <div className="h-[300px] overflow-y-auto border border-zinc-700 rounded-md p-2 space-y-3 custom-scrollbar">
                                {allSongs.length === 0 && (
                                    <p className="text-sm text-zinc-500">No songs available.</p>
                                )}
                                {allSongs.map((song) => (
                                    <div
                                        key={song._id}
                                        className={cn(
                                            "flex items-center gap-3 bg-zinc-800/60 p-3 rounded-lg hover:bg-zinc-700/60 transition cursor-pointer",
                                            selectedSongs.includes(song._id) && "border border-green-500"
                                        )}
                                        onClick={() => toggleSongSelection(song._id)}
                                    >
                                        <Checkbox
                                            id={song._id}
                                            checked={selectedSongs.includes(song._id)}
                                            onCheckedChange={() => toggleSongSelection(song._id)}
                                            className="border-zinc-500 data-[state=checked]:bg-green-600 data-[state=checked]:text-white"
                                        />
                                        <img src={song.imageUrl} alt={song.title} className="w-12 h-12 rounded object-cover"/>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-sm text-white truncate font-medium">{song.title}</p>
                                            <p className="text-xs text-zinc-400 truncate">{song.artist}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setShowEditDialog(false)} variant="ghost">Cancel</Button>
                        <Button onClick={handleUpdatePlaylist} className="bg-green-600 hover:bg-green-700">Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                    <DialogHeader><DialogTitle>Delete Playlist</DialogTitle></DialogHeader>
                    <p>Are you sure you want to delete "{currentPlaylist.title}"? This action cannot be undone.</p>
                    <DialogFooter>
                        <Button onClick={() => setShowDeleteDialog(false)} variant="ghost">Cancel</Button>
                        <Button onClick={handleDeletePlaylist} variant="destructive">Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PlaylistPage;