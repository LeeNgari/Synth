import { useMusicStore } from "@/stores/useMusicStore";
import { useEffect } from "react";
import FeaturedSection from "./components/FeaturedSection";
import { ScrollArea } from "@/components/ui/scroll-area";
import SectionGrid from "./components/SectionGrid";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { SignedIn, SignedOut, useAuth } from "@clerk/clerk-react"; 
import PlaylistGrid from "./components/PlaylistGrid";
import { Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";

const HomePage = () => {
	const {
		fetchFeaturedSongs,
		fetchMadeForYouSongs,
		fetchTrendingSongs,
		fetchLikedSongs,
		fetchHistorySongs,
		fetchPublicPlaylists,
		fetchUserPlaylists,
		isLoading, // This isLoading is still global
		madeForYouSongs,
		featuredSongs,
		trendingSongs,
		likedSongs,
		historySongs,
		publicPlaylists,
		userPlaylists,
	} = useMusicStore();

	const { initializeQueue } = usePlayerStore();
	const { isSignedIn } = useAuth(); 

	
	useEffect(() => {
		fetchFeaturedSongs();
		fetchTrendingSongs(); 
	}, [fetchFeaturedSongs]);


	// Effect for user-specific songs (liked, history, personalized made-for-you/trending)
	useEffect(() => {
		if (isSignedIn) { // Only fetch if user is signed in
			fetchLikedSongs();
			fetchHistorySongs();
			fetchMadeForYouSongs(); // Assuming this is user-specific
			fetchTrendingSongs(); // Assuming this is user-specific, or remove if public
			fetchPublicPlaylists();
			fetchUserPlaylists();
		} else {
		}
	}, [isSignedIn, fetchLikedSongs, fetchHistorySongs, fetchMadeForYouSongs, fetchTrendingSongs, fetchPublicPlaylists, fetchUserPlaylists]);


	useEffect(() => {
		
		if (madeForYouSongs.length > 0 && featuredSongs.length > 0 && trendingSongs.length > 0) {
			const allSongs = [...featuredSongs, ...madeForYouSongs, ...trendingSongs];
			initializeQueue(allSongs);
		}
	}, [initializeQueue, madeForYouSongs, trendingSongs, featuredSongs]);

	return (
		<main className='rounded-md overflow-hidden h-full bg-[#2e6f57]'>
		
			<SignedIn>
				<ScrollArea className='h-[calc(100vh-180px)]'>
					<div className='p-4 sm:p-6'>
						<h1 className='text-2xl sm:text-3xl font-bold mb-6'>Welcome Back!</h1>
						<FeaturedSection /> 

						<div className='space-y-8'>
							<SectionGrid title='Your Liked Songs' songs={likedSongs} isLoading={isLoading} />
							<SectionGrid title='Recently Played' songs={historySongs} isLoading={isLoading} />
							<SectionGrid title='Made For You' songs={madeForYouSongs} isLoading={isLoading} />
							<SectionGrid title='Trending Songs' songs={trendingSongs} isLoading={isLoading} />
							<PlaylistGrid title='Public Playlists' playlists={publicPlaylists} isLoading={isLoading} />
							{userPlaylists.length > 0 ? (
								<PlaylistGrid title='Your Playlists' playlists={userPlaylists} isLoading={isLoading} />
							) : (
								<div className="text-center p-8">
									<h3 className="text-lg font-semibold mb-2">You have no playlists yet.</h3>
									<Link to="/library" className="text-green-400 hover:underline flex items-center justify-center gap-2">
										<PlusCircle size={20} />
										Create a playlist
									</Link>
								</div>
							)}
						</div>
					</div>
				</ScrollArea>
			</SignedIn>

			<SignedOut>
				<ScrollArea className='h-[calc(100vh-180px)]'>
					<div className='p-4 sm:p-6'>
						<h1 className='text-2xl sm:text-3xl font-bold mb-6'>Explore Music!</h1>
						<FeaturedSection />

						<div className='space-y-8'>
							<SectionGrid title='Discover New Music' songs={featuredSongs} isLoading={isLoading} />
							<SectionGrid title='Trending Songs' songs={trendingSongs} isLoading={isLoading} />

							<p className="text-zinc-400 text-center mt-8">Sign in to unlock personalized content!</p>
						</div>
					</div>
				</ScrollArea>
			</SignedOut>
		</main>
	);
};
export default HomePage;