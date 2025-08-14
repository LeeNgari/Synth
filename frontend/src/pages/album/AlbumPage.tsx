import { ScrollArea } from "@/components/ui/scroll-area";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Clock, Pause, Play, MoreVertical } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/useAuthStore";
import toast from "react-hot-toast";
import axios from "axios";
import { Song as SongType, Playlist as PlaylistType } from "@/types";

export const formatDuration = (seconds: number) => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const AlbumPage = () => {
	const { albumId } = useParams();
	const { fetchAlbumById, currentAlbum, isLoading } = useMusicStore();
	const { currentSong, isPlaying, playAlbum, togglePlay } = usePlayerStore();
	const { user: currentUser } = useAuthStore();

	const [showAddToPlaylistDialog, setShowAddToPlaylistDialog] = useState(false);
	const [selectedSongToAdd, setSelectedSongToAdd] = useState<SongType | null>(null);
	const [userPlaylists, setUserPlaylists] = useState<PlaylistType[]>([]);
	const [selectedPlaylistsForSong, setSelectedPlaylistsForSong] = useState<string[]>([]);

	useEffect(() => {
		if (albumId) fetchAlbumById(albumId);
	}, [fetchAlbumById, albumId]);

	useEffect(() => {
		const fetchUserPlaylists = async () => {
			if (!currentUser) return;
			try {
				const res = await axios.get("http://localhost:5000/api/playlists/me", { withCredentials: true });
				if (res.data.success) {
					setUserPlaylists(res.data.playlists);
				}
			} catch (err) {
				console.error("Failed to fetch user playlists:", err);
				toast.error("Failed to load your playlists.");
			}
		};
		fetchUserPlaylists();
	}, [currentUser]);

	if (isLoading || !currentAlbum) return null; // Handle loading and no album found

	const handlePlayAlbum = () => {
		if (!currentAlbum) return;

		const isCurrentAlbumPlaying = currentAlbum?.songs.some((song) => song._id === currentSong?._id);
		if (isCurrentAlbumPlaying) togglePlay();
		else {
			playAlbum(currentAlbum?.songs, 0);
		}
	};

	const handlePlaySong = (index: number) => {
		if (!currentAlbum) return;

		playAlbum(currentAlbum?.songs, index);
	};

	const handleAddToPlaylistClick = (song: SongType) => {
		setSelectedSongToAdd(song);
		setSelectedPlaylistsForSong([]); // Clear previous selections
		setShowAddToPlaylistDialog(true);
	};

	const handleTogglePlaylistSelection = (playlistId: string) => {
		setSelectedPlaylistsForSong(prev =>
			prev.includes(playlistId) ? prev.filter(id => id !== playlistId) : [...prev, playlistId]
		);
	};

	const handleAddSongToSelectedPlaylists = async () => {
		if (!selectedSongToAdd || selectedPlaylistsForSong.length === 0) {
			toast.error("Please select at least one playlist.");
			return;
		}

		let successCount = 0;
		let errorCount = 0;

		for (const playlistId of selectedPlaylistsForSong) {
			try {
				await axios.post(
					`http://localhost:5000/api/playlists/${playlistId}/songs/${selectedSongToAdd._id}`,
					{},
					{ withCredentials: true }
				);
				successCount++;
			} catch (err: any) {
				console.error(`Failed to add song to playlist ${playlistId}:`, err);
				errorCount++;
				// Optionally show individual error toasts, but a summary is often better for multiple operations
			}
		}

		if (successCount > 0) {
			toast.success(`Added song to ${successCount} playlist(s).`);
		}
		if (errorCount > 0) {
			toast.error(`Failed to add song to ${errorCount} playlist(s).`);
		}

		setShowAddToPlaylistDialog(false);
		setSelectedSongToAdd(null);
		setSelectedPlaylistsForSong([]);
	};

	return (
		<div className='h-full bg-[#2e6f57]'>
			<ScrollArea className='h-full'>
				{/* Hero Section */}
				<div className='relative pt-8 pb-6 px-8'>
					<div className='absolute inset-0 bg-gradient-to-b from-[#2e6f57]/50 to-transparent pointer-events-none' />

					<div className='relative z-10 flex flex-col md:flex-row gap-6 items-end'>
						<img
							src={currentAlbum?.imageUrl}
							alt={currentAlbum?.title}
							className='w-48 h-48 md:w-60 md:h-60 lg:w-72 lg:h-72 shadow-lg rounded-xl border-2 border-[#2e6f57]/50 object-cover'
						/>

						<div className='flex-1 space-y-4'>
							<p className='text-sm font-semibold text-white'>ALBUM</p>
							<h1 className='text-4xl md:text-5xl lg:text-6xl font-bold text-white'>
								{currentAlbum?.title}
							</h1>

							<div className='flex items-center gap-2 text-sm text-zinc-300'>
								<span className='font-medium text-white'>{currentAlbum?.artist}</span>
								<span>•</span>
								<span>{currentAlbum?.songs.length} songs</span>
								<span>•</span>
								<span>{currentAlbum?.releaseYear}</span>
							</div>
						</div>
					</div>
				</div>

				{/* Play Button */}
				<div className='px-8 pb-6'>
					<button
						onClick={handlePlayAlbum}
						className='flex items-center justify-center size-14 rounded-full bg-[#2e6f57] hover:bg-[#3a8c6e] 
        transition-all shadow-lg hover:scale-105 active:scale-95'
					>
						{isPlaying && currentAlbum?.songs.some((song) => song._id === currentSong?._id) ? (
							<Pause className='h-6 w-6 text-white' />
						) : (
							<Play className='h-6 w-6 text-white' />
						)}
					</button>
				</div>

				{/* Songs List */}
				<div className='px-4 pb-8'>
					{/* Table Header */}
					<div className='grid grid-cols-[16px_4fr_2fr_1fr_24px] gap-4 px-6 py-3 text-sm 
          text-zinc-400 border-b border-zinc-800'>
						<div className='text-center'>#</div>
						<div>TITLE</div>
						<div>ARTIST</div>
						<div className='flex justify-end pr-4'>
							<Clock className='h-4 w-4' />
						</div>
						<div></div> {/* For MoreVertical icon */}
					</div>

					{/* Songs */}
					<div className='divide-y divide-zinc-800/50'>
						{currentAlbum?.songs.map((song, index) => {
							const isCurrentSong = currentSong?._id === song._id;
							return (
								<div
									key={song._id}
									onClick={() => handlePlaySong(index)}
									className={`grid grid-cols-[16px_4fr_2fr_1fr_24px] gap-4 px-6 py-3 text-sm 
                hover:bg-[#2e6f57]/30 rounded-md group cursor-pointer transition-colors
                ${isCurrentSong ? 'text-white bg-[#2e6f57]/20' : 'text-white'}`}
								>
									<div className='flex items-center justify-center'>
										{isCurrentSong && isPlaying ? (
											<div className='size-4 text-white flex items-center justify-center'>
												<div className='w-1 h-3 bg-white mx-[1px] animate-pulse' style={{ animationDelay: `${index * 0.1}s` }} />
												<div className='w-1 h-4 bg-white mx-[1px] animate-pulse' style={{ animationDelay: `${index * 0.1 + 0.1}s` }} />
												<div className='w-1 h-2 bg-white mx-[1px] animate-pulse' style={{ animationDelay: `${index * 0.1 + 0.2}s` }} />
											</div>
										) : (
											<>
												<span className='group-hover:hidden text-zinc-400'>{index + 1}</span>
												<Play className='h-3 w-3 hidden group-hover:block text-white' />
											</>
										)}
									</div>

									<div className='flex items-center gap-4'>
										<img
											src={song.imageUrl}
											alt={song.title}
											className='size-10 rounded-sm object-cover border border-zinc-700/30'
										/>
										<div>
											<div className={`font-medium ${isCurrentSong ? 'text-white' : 'text-white'}`}>
												{song.title}
											</div>
											<div className='text-zinc-300'>{song.artist}</div>
										</div>
									</div>

									<div className='flex items-center text-zinc-300'>
										{new Date(song.createdAt).toLocaleDateString()}
									</div>

									<div className='flex items-center justify-end pr-4 text-zinc-300'>
										{formatDuration(song.duration)}
									</div>

									<div className='flex items-center justify-center'>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<button className="p-1 rounded-full hover:bg-zinc-700 text-zinc-400 hover:text-white">
													<MoreVertical className="size-4" />
												</button>
											</DropdownMenuTrigger>
											<DropdownMenuContent className="bg-zinc-800 border-zinc-700 text-white">
												<DropdownMenuItem onSelect={() => handleAddToPlaylistClick(song)} className="hover:bg-zinc-700 cursor-pointer">
													Add to Playlist
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</ScrollArea>

			{/* Add to Playlist Dialog */}
			<Dialog open={showAddToPlaylistDialog} onOpenChange={setShowAddToPlaylistDialog}>
				<DialogContent className="bg-zinc-900 border-zinc-800 text-white">
					<DialogHeader>
						<DialogTitle>Add "{selectedSongToAdd?.title}" to Playlist</DialogTitle>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						{userPlaylists.length === 0 ? (
							<p className="text-zinc-400">You don't have any playlists yet. Create one first!</p>
						) : (
							<div className="h-[200px] overflow-y-auto space-y-2">
								{userPlaylists.map(playlist => (
									<div key={playlist._id} className="flex items-center gap-2">
										<Checkbox
											id={playlist._id}
											checked={selectedPlaylistsForSong.includes(playlist._id)}
											onCheckedChange={() => handleTogglePlaylistSelection(playlist._id)}
											className="border-zinc-500 data-[state=checked]:bg-green-600 data-[state=checked]:text-white"
										/>
										<Label htmlFor={playlist._id} className="text-white cursor-pointer">
											{playlist.title}
										</Label>
									</div>
								))}
							</div>
						)}
					</div>
					<DialogFooter>
						<Button onClick={() => setShowAddToPlaylistDialog(false)} variant="ghost">Cancel</Button>
						<Button onClick={handleAddSongToSelectedPlaylists} className="bg-green-600 hover:bg-green-700" disabled={selectedPlaylistsForSong.length === 0 || !currentUser}>Add to Playlists</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};
export default AlbumPage;