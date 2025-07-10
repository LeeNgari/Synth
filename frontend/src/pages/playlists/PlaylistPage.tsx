import { ScrollArea } from "@/components/ui/scroll-area";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Clock, Pause, Play } from "lucide-react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

export const formatDuration = (seconds: number) => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const PlaylistPage = () => {
	const { playlistId } = useParams();
	const {
		fetchPlaylistById,
		fetchSongsByIds,
		currentPlaylist,
		playlistSongs,
		isLoading,
	} = useMusicStore();

	const { currentSong, isPlaying, playAlbum, togglePlay } = usePlayerStore();

	useEffect(() => {
		if (!playlistId) return;

		const loadPlaylist = async () => {
			await fetchPlaylistById(playlistId);
		};

		loadPlaylist();
	}, [playlistId, fetchPlaylistById]);

	useEffect(() => {
		if (currentPlaylist?.songs?.length) {
			fetchSongsByIds(currentPlaylist.songs);
		}
	}, [currentPlaylist, fetchSongsByIds]);

	if (isLoading || !currentPlaylist) return null;

	const handlePlayPlaylist = () => {
		if (!playlistSongs.length) return;

		const isCurrentPlaylistPlaying = playlistSongs.some(
			(song) => song._id === currentSong?._id
		);

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
				{/* Header */}
				<div className='relative pt-8 pb-6 px-8'>
					<div className='absolute inset-0 bg-gradient-to-b from-[#2e6f57]/50 to-transparent pointer-events-none' />
					<div className='relative z-10 flex flex-col md:flex-row gap-6 items-end'>
						<img
							src={currentPlaylist.imageUrl}
							alt={currentPlaylist.title}
							className='w-48 h-48 md:w-60 md:h-60 lg:w-72 lg:h-72 shadow-lg rounded-xl border-2 border-[#2e6f57]/50 object-cover'
						/>
						<div className='flex-1 space-y-4'>
							<p className='text-sm font-semibold text-white'>PLAYLIST</p>
							<h1 className='text-4xl md:text-5xl lg:text-6xl font-bold text-white'>
								{currentPlaylist.title}
							</h1>
							{currentPlaylist.description && (
								<p className='text-zinc-300 max-w-xl'>{currentPlaylist.description}</p>
							)}
							<div className='flex items-center gap-2 text-sm text-zinc-300'>
								
								<span>{playlistSongs.length} songs</span>
							</div>
						</div>
					</div>
				</div>

				{/* Play Button */}
				<div className='px-8 pb-6'>
					<button
						onClick={handlePlayPlaylist}
						className='flex items-center justify-center size-14 rounded-full bg-[#2e6f57] hover:bg-[#3a8c6e] transition-all shadow-lg hover:scale-105 active:scale-95'
					>
						{isPlaying && playlistSongs.some((s) => s._id === currentSong?._id) ? (
							<Pause className='h-6 w-6 text-white' />
						) : (
							<Play className='h-6 w-6 text-white' />
						)}
					</button>
				</div>

				{/* Songs Table */}
				<div className='px-4 pb-8'>
					{/* Table Header */}
					<div className='grid grid-cols-[16px_4fr_2fr_1fr] gap-4 px-6 py-3 text-sm text-zinc-400 border-b border-zinc-800'>
						<div className='text-center'>#</div>
						<div>TITLE</div>
						<div>ARTIST</div>
						<div className='flex justify-end pr-4'>
							<Clock className='h-4 w-4' />
						</div>
					</div>

					{/* Songs */}
					<div className='divide-y divide-zinc-800/50'>
						{playlistSongs.map((song, index) => {
							const isCurrentSong = currentSong?._id === song._id;
							return (
								<div
									key={song._id}
									onClick={() => handlePlaySong(index)}
									className={`grid grid-cols-[16px_4fr_2fr_1fr] gap-4 px-6 py-3 text-sm hover:bg-[#2e6f57]/30 rounded-md group cursor-pointer transition-colors ${
										isCurrentSong ? "text-white bg-[#2e6f57]/20" : "text-white"
									}`}
								>
									{/* Index or Play Icon */}
									<div className='flex items-center justify-center'>
										{isCurrentSong && isPlaying ? (
											<div className='size-4 flex items-center justify-center'>
												<div className='w-1 h-3 bg-white mx-[1px] animate-pulse' />
												<div className='w-1 h-4 bg-white mx-[1px] animate-pulse' />
												<div className='w-1 h-2 bg-white mx-[1px] animate-pulse' />
											</div>
										) : (
											<>
												<span className='group-hover:hidden text-zinc-400'>{index + 1}</span>
												<Play className='h-3 w-3 hidden group-hover:block text-white' />
											</>
										)}
									</div>

									{/* Title & Image */}
									<div className='flex items-center gap-4'>
										<img
											src={song.imageUrl}
											alt={song.title}
											className='size-10 rounded-sm object-cover border border-zinc-700/30'
										/>
										<div>
											<div className='font-medium text-white'>{song.title}</div>
										</div>
									</div>

									{/* Artist */}
									<div className='flex items-center text-zinc-300'>
										{song.artist}
									</div>

									{/* Duration */}
									<div className='flex items-center justify-end pr-4 text-zinc-300'>
										{formatDuration(song.duration)}
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</ScrollArea>
		</div>
	);
};

export default PlaylistPage;