import { useMusicStore } from "@/stores/useMusicStore";
import { useEffect } from "react";
import FeaturedSection from "./components/FeaturedSection";
import { ScrollArea } from "@/components/ui/scroll-area";
import SectionGrid from "./components/SectionGrid";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { SignedIn, SignedOut, useAuth } from "@clerk/clerk-react"; 

const HomePage = () => {
	const {
		fetchFeaturedSongs,
		fetchMadeForYouSongs,
		fetchTrendingSongs,
		fetchLikedSongs,
		fetchHistorySongs,
		isLoading, // This isLoading is still global
		madeForYouSongs,
		featuredSongs,
		trendingSongs,
		likedSongs,
		historySongs,
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
		} else {
		}
	}, [isSignedIn, fetchLikedSongs, fetchHistorySongs, fetchMadeForYouSongs, fetchTrendingSongs]);


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