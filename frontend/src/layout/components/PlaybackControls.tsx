import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { SignedIn, SignedOut, useAuth } from "@clerk/clerk-react";
import {
	Laptop2,
	ListMusic,
	Mic2,
	Pause,
	Play,
	Repeat,
	Shuffle,
	SkipBack,
	SkipForward,
	Volume1,
	ThumbsUp,
	ThumbsDown,
} from "lucide-react";
import AiButton from "./AiButton"
import { useEffect, useRef, useState } from "react";
const formatTime = (seconds: number) => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.floor(seconds % 60);
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

interface PlaybackControlsProps {
	toggleFriendsPanel: () => void;
	isFriendsPanelOpen: boolean;
}



export const PlaybackControls = ({ toggleFriendsPanel, isFriendsPanelOpen }: PlaybackControlsProps) => {
	const {
		currentSong,
		isPlaying,
		togglePlay,
		playNext,
		playPrevious,
		likeSong,
		dislikeSong,
	} = usePlayerStore();

	const [volume, setVolume] = useState(75);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const audioRef = useRef<HTMLAudioElement | null>(null);


	useEffect(() => {
		audioRef.current = document.querySelector("audio");

		const audio = audioRef.current;
		if (!audio) return;

		const updateTime = () => setCurrentTime(audio.currentTime);
		const updateDuration = () => setDuration(audio.duration);

		audio.addEventListener("timeupdate", updateTime);
		audio.addEventListener("loadedmetadata", updateDuration);

		const handleEnded = () => {
			usePlayerStore.setState({ isPlaying: false });
		};

		audio.addEventListener("ended", handleEnded);

		return () => {
			audio.removeEventListener("timeupdate", updateTime);
			audio.removeEventListener("loadedmetadata", updateDuration);
			audio.removeEventListener("ended", handleEnded);
		};
	}, [currentSong]);

	const handleSeek = (value: number[]) => {
		if (audioRef.current) {
			audioRef.current.currentTime = value[0];
		}
	};

	return (
		<footer className='h-20 sm:h-24 bg-[#2e6f57] px-4'>
			<div className='flex justify-between items-center h-full max-w-[1800px] mx-auto'>
				{/* currently playing song */}
				<div className='hidden sm:flex items-center gap-4 min-w-[180px] w-[30%] text-white'>
					{currentSong && (
						<>
							<img
								src={currentSong.imageUrl}
								alt={currentSong.title}
								className='w-14 h-14 object-cover rounded-md'
							/>
							<div className='flex-1 min-w-0'>
								<div className='font-medium truncate hover:underline cursor-pointer'>
									{currentSong.title}
								</div>
								<div className='text-sm text-white/70 truncate hover:underline cursor-pointer'>
									{currentSong.artist}
								</div>
							</div>
							{/* Like / Dislike Buttons */}
							<SignedIn>
								<div className='flex gap-2 ml-2'>
									<Button
										size='icon'
										variant='ghost'
										className={`hover:bg-white ${currentSong.likedByCurrentUser ? "text-green-400" : "text-white"
											}`}
										onClick={() => likeSong(currentSong._id)}
									>
										<ThumbsUp className='h-4 w-4' />
									</Button>
									<Button
										size='icon'
										variant='ghost'
										className={`hover:bg-white ${currentSong.dislikedByCurrentUser ? "text-red-400" : "text-white"
											}`}
										onClick={() => dislikeSong(currentSong._id)}
									>
										<ThumbsDown className='h-4 w-4' />
									</Button>
								</div>
							</SignedIn>

						</>
					)}
				</div>

				{/* player controls*/}
				<div className='flex flex-col items-center gap-2 flex-1 max-w-full sm:max-w-[45%]'>
					<div className='flex items-center gap-4 sm:gap-6'>
						<Button
							size='icon'
							variant='ghost'
							className='hidden sm:inline-flex text-white hover:text-black hover:bg-white'
						>
							<Shuffle className='h-4 w-4' />
						</Button>

						<Button
							size='icon'
							variant='ghost'
							className='text-white hover:text-black hover:bg-white'
							onClick={playPrevious}
							disabled={!currentSong}
						>
							<SkipBack className='h-4 w-4' />
						</Button>

						<Button
							size='icon'
							className='bg-white hover:bg-[#2e6f57] hover:text-white text-[#2e6f57] rounded-full h-8 w-8'
							onClick={togglePlay}
							disabled={!currentSong}
						>
							{isPlaying ? <Pause className='h-5 w-5' /> : <Play className='h-5 w-5' />}
						</Button>

						<Button
							size='icon'
							variant='ghost'
							className='text-white hover:text-black hover:bg-white'
							onClick={playNext}
							disabled={!currentSong}
						>
							<SkipForward className='h-4 w-4' />
						</Button>

					</div>

					<div className='hidden sm:flex items-center gap-2 w-full'>
						<div className='text-xs text-white'>{formatTime(currentTime)}</div>
						<Slider
							value={[currentTime]}
							max={duration || 100}
							step={1}
							className='w-full hover:cursor-grab active:cursor-grabbing'
							onValueChange={handleSeek}
						/>
						<div className='text-xs text-white/70'>{formatTime(duration)}</div>
					</div>
				</div>

				{/* volume controls */}
				<div className='hidden sm:flex items-center gap-4 min-w-[180px] w-[30%] justify-end text-white'>



					<div className='flex items-center gap-2'>
						<Button size='icon' variant='ghost' className='text-white hover:text-black hover:bg-white'>
							<Volume1 className='h-4 w-4' />
						</Button>

						<Slider
							value={[volume]}
							max={100}
							step={1}
							className='w-24 hover:cursor-grab active:cursor-grabbing'
							onValueChange={(value) => {
								setVolume(value[0]);
								if (audioRef.current) {
									audioRef.current.volume = value[0] / 100;
								}
							}}
						/>
					</div>
					<SignedIn>
						<AiButton
							toggleFriendsPanel={toggleFriendsPanel}
							isActive={isFriendsPanelOpen} />
					</SignedIn>

				</div>
			</div>
		</footer>
	);
};
