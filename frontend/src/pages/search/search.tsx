import { useEffect, useState } from "react";
import { axiosInstance } from "@/lib/axios";
import { Album, Song } from "@/types";
import { Link } from "react-router-dom";
import PlayButton from "../home/components/PlayButton";
import { useMusicStore } from "@/stores/useMusicStore"; // Import useMusicStore

interface SearchResponse {
    success: boolean;
    songs: Song[];
    albums: Album[];
}

const SearchPage = () => {
    const [query, setQuery] = useState("");
    const [songs, setSongs] = useState<Song[]>([]);
    const [albums, setAlbums] = useState<Album[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // From useMusicStore for the Explore section
    const { albums: exploreAlbums, fetchAlbums, isLoading: isLoadingExplore } = useMusicStore();

    useEffect(() => {
        // Fetch albums for the explore section when the component mounts
        fetchAlbums();
    }, [fetchAlbums]);

    const fetchResults = async (searchTerm: string) => {
        if (!searchTerm.trim()) {
            setSongs([]);
            setAlbums([]);
            return;
        }

        setIsLoading(true);
        try {
            const res = await axiosInstance.get<SearchResponse>(`/songs/search?q=${searchTerm}`);
            if (res.data.success) {
                setSongs(res.data.songs);
                setAlbums(res.data.albums);
            }
        } catch (err) {
            console.error("Search failed", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchResults(query);
        }, 300);

        return () => clearTimeout(debounce);
    }, [query]);

    const showSearchResults = query.trim().length > 0;

    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            {/* Search Input */}
            <div className="relative mb-8">
                <input
                    type="text"
                    placeholder="Search songs, albums, or artists..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full px-6 py-4 bg-zinc-800 rounded-full text-white placeholder-zinc-400 
                     focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-zinc-700 text-lg"
                />
                <svg
                    className="absolute right-6 top-4 h-6 w-6 text-zinc-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            {isLoading && showSearchResults && ( // Only show loading for search results
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                </div>
            )}

            {/* Search Results */}
            {showSearchResults ? (
                <div className="space-y-10">
                    {/* Songs Section - Horizontal Scroll */}
                    {songs.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6">Songs</h2>
                            <div className="relative">
                                <div className="flex space-x-4 pb-4 overflow-x-auto scrollbar-hide">
                                    {songs.map((song) => (
                                        <div
                                            key={song._id}
                                            className="flex-shrink-0 w-64 bg-zinc-800 rounded-lg p-4 hover:bg-zinc-700 transition-colors group relative"
                                        >
                                            <div className="relative mb-4">
                                                <img
                                                    src={song.imageUrl}
                                                    alt={song.title}
                                                    className="w-full aspect-square rounded-md object-cover"
                                                />
                                                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <PlayButton song={song} />
                                                </div>
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-medium text-white truncate">{song.title}</h3>
                                                <p className="text-sm text-zinc-400 truncate">{song.artist}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Albums Section - Grid Layout */}
                    {albums.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6">Albums</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                                {albums.map((album) => (
                                    <Link
                                        to={`/albums/${album._id}`}
                                        key={album._id}
                                        className="group flex flex-col p-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
                                    >
                                        <div className="relative w-full aspect-square mb-3">
                                            <img
                                                src={album.imageUrl}
                                                alt={album.title}
                                                className="w-full h-full rounded-md object-cover shadow-lg group-hover:opacity-90 transition-opacity"
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-medium text-white truncate">{album.title}</h3>
                                            <p className="text-sm text-zinc-400 truncate">{album.artist}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Empty State for Search Results */}
                    {!isLoading && songs.length === 0 && albums.length === 0 && (
                        <div className="text-center py-16">
                            <svg
                                className="mx-auto h-12 w-12 text-zinc-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="mt-2 text-lg font-medium text-white">No results found</h3>
                            <p className="mt-1 text-zinc-400">Try different search terms</p>
                        </div>
                    )}
                </div>
            ) : (
                // Explore Section (shown when no search query)
                <div className="space-y-10">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-6">Explore Albums</h2>
                        {isLoadingExplore ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                {/* You can reuse PlaylistSkeleton or create a simpler skeleton for individual album items */}
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="flex flex-col items-center p-4 rounded-lg bg-zinc-800 animate-pulse">
                                        <div className="relative w-full aspect-square mb-3 bg-zinc-700 rounded-md"></div>
                                        <div className='w-full h-4 bg-zinc-700 rounded mb-2'></div>
                                        <div className='w-3/4 h-3 bg-zinc-700 rounded'></div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                                {exploreAlbums.map((album) => (
                                    <Link
                                        to={`/albums/${album._id}`}
                                        key={album._id}
                                        className="group flex flex-col p-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
                                    >
                                        <div className="relative w-full aspect-square mb-3">
                                            <img
                                                src={album.imageUrl}
                                                alt={album.title}
                                                className="w-full h-full rounded-md object-cover shadow-lg group-hover:opacity-90 transition-opacity"
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-medium text-white truncate">{album.title}</h3>
                                            <p className="text-sm text-zinc-400 truncate">{album.artist}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
};

export default SearchPage;