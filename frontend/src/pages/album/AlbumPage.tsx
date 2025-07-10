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

const AlbumPage = () => {
	const { albumId } = useParams();
	const { fetchAlbumById, currentAlbum, isLoading } = useMusicStore();
	const { currentSong, isPlaying, playAlbum, togglePlay } = usePlayerStore();

	useEffect(() => {
		if (albumId) fetchAlbumById(albumId);
	}, [fetchAlbumById, albumId]);

	if (isLoading) return null;

	const handlePlayAlbum = () => {
		if (!currentAlbum) return;

		const isCurrentAlbumPlaying = currentAlbum?.songs.some((song) => song._id === currentSong?._id);
		if (isCurrentAlbumPlaying) togglePlay();
		else {
			// start playing the album from the beginning
			playAlbum(currentAlbum?.songs, 0);
		}
	};

	const handlePlaySong = (index: number) => {
		if (!currentAlbum) return;

		playAlbum(currentAlbum?.songs, index);
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
					<div className='grid grid-cols-[16px_4fr_2fr_1fr] gap-4 px-6 py-3 text-sm 
          text-zinc-400 border-b border-zinc-800'>
						<div className='text-center'>#</div>
						<div>TITLE</div>
						<div>RELEASE DATE</div>
						<div className='flex justify-end pr-4'>
							<Clock className='h-4 w-4' />
						</div>
					</div>

					{/* Songs */}
					<div className='divide-y divide-zinc-800/50'>
						{currentAlbum?.songs.map((song, index) => {
							const isCurrentSong = currentSong?._id === song._id;
							return (
								<div
									key={song._id}
									onClick={() => handlePlaySong(index)}
									className={`grid grid-cols-[16px_4fr_2fr_1fr] gap-4 px-6 py-3 text-sm 
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
								</div>
							);
						})}
					</div>
				</div>
			</ScrollArea>
		</div>
	);
};
export default AlbumPage;
