import { Song } from "@/types";
import SectionGridSkeleton from "./SectionGridSkeleton";
import { Button } from "@/components/ui/button";
import PlayButton from "./PlayButton";

type SectionGridProps = {
	title: string;
	songs: Song[];
	isLoading: boolean;
};

const SectionGrid = ({ songs, title, isLoading }: SectionGridProps) => {
	if (isLoading) return <SectionGridSkeleton />;

	return (
		<div className='mb-6'> {/* Reduced margin-bottom */}
			<div className='flex items-center justify-between mb-3'> {/* Reduced margin-bottom */}
				<h2 className='text-lg sm:text-xl font-bold'>{title}</h2> {/* Reduced text size */}
				<Button variant='link' className='text-xs text-zinc-400 hover:text-white'> {/* Reduced text size */}
					Show all
				</Button>
			</div>

			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'> {/* Reduced gap */}
				{songs.map((song) => (
					<div
						key={song._id}
						className='bg-zinc-800 p-3 rounded-md hover:bg-zinc-700/40 transition-all group cursor-pointer' 
					>
						<div className='relative mb-3'> {/* Reduced margin-bottom */}
							<div className='aspect-square rounded-md shadow-md overflow-hidden'> {/* Changed shadow from lg to md */}
								<img
									src={song.imageUrl}
									alt={song.title}
									className='w-full h-full object-cover transition-transform duration-300 
                  group-hover:scale-105'
								/>
							</div>
							<PlayButton song={song} />
						</div>
						<h3 className='font-medium mb-1 text-sm truncate'>{song.title}</h3> {/* Reduced text size and margin */}
						<p className='text-xs text-zinc-400 truncate'>{song.artist}</p> {/* Reduced text size */}
					</div>
				))}
			</div>
		</div>
	);
};

export default SectionGrid;