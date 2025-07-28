import { Song } from "@/types";
import SectionGridSkeleton from "./SectionGridSkeleton";
import PlayButton from "./PlayButton";

type SectionGridProps = {
	title: string;
	songs: Song[];
	isLoading: boolean;
};

const SectionGrid = ({ songs, title, isLoading }: SectionGridProps) => {
	if (isLoading) return <SectionGridSkeleton />;

	return (
		<div className='mb-8'>
			<div className='flex items-center justify-between mb-4'>
				<h2 className='text-xl font-bold'>{title}</h2>
			</div>

			{/* Changed grid to flex for horizontal scrolling */}
			<div className='flex overflow-x-auto gap-4 scrollbar-hide pb-2'> {/* Added pb-2 for a bit of bottom padding in case of hidden scrollbar */}
				{songs.map((song) => (
					<div
						key={song._id}
						className='bg-zinc-800 p-4 rounded-md hover:bg-zinc-700/40 transition-all group cursor-pointer flex-none w-48' // Added flex-none and w-48 for fixed width
					>
						<div className='relative mb-4'>
							<div className='aspect-square rounded-md shadow-md overflow-hidden'>
								<img
									src={song.imageUrl}
									alt={song.title}
									className='w-full h-full object-cover transition-transform duration-300
                  group-hover:scale-105'
								/>
							</div>
							<PlayButton song={song} />
						</div>
						<h3 className='font-medium mb-2 text-base truncate'>{song.title}</h3>
						<p className='text-sm text-zinc-400 truncate'>{song.artist}</p>
					</div>
				))}
			</div>
		</div>
	);
};

export default SectionGrid;