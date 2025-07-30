import { axiosInstance } from "@/lib/axios";
import { Album, Song, Stats, Playlist } from "@/types";
import toast from "react-hot-toast";
import { create } from "zustand";
import axios from "axios";


interface MusicStore {
	songs: Song[];
	albums: Album[];
	isLoading: boolean;
	error: string | null;
	currentAlbum: Album | null;
	featuredSongs: Song[];
	playlistSongs: Song[];
	madeForYouSongs: Song[];
	trendingSongs: Song[];
	likedSongs: Song[];
	historySongs: Song[];
	stats: Stats;

	currentPlaylist: Playlist | null;

	fetchPlaylistById: (id: string) => Promise<void>;


	fetchAlbums: () => Promise<void>;
	fetchAlbumById: (id: string) => Promise<void>;
	fetchFeaturedSongs: () => Promise<void>;
	fetchSongsByIds: (id: string[]) => Promise<void>;
	fetchMadeForYouSongs: () => Promise<void>;
	fetchLikedSongs: () => Promise<void>;
	fetchHistorySongs: () => Promise<void>;
	fetchTrendingSongs: () => Promise<void>;
	fetchStats: () => Promise<void>;
	fetchSongs: () => Promise<void>;
	deleteSong: (id: string) => Promise<void>;
	deleteAlbum: (id: string) => Promise<void>;
}

export const useMusicStore = create<MusicStore>((set) => ({
	albums: [],
	songs: [],
	isLoading: false,
	error: null,
	currentAlbum: null,
	currentPlaylist: null,
	madeForYouSongs: [],
	playlistSongs: [],
	likedSongs: [],
	historySongs: [],
	featuredSongs: [],
	trendingSongs: [],
	stats: {
		totalSongs: 0,
		totalAlbums: 0,
		totalUsers: 0,
		totalArtists: 0,
	},

	fetchPlaylistById: async (id: string) => {
		set({ isLoading: true, error: null });
		console.log("Fetching playlist with ID:", id);
		try {
			const res = await fetch(`http://localhost:5000/api/playlists/${id}`, {
				method: "GET",
				credentials: "include", // ✅ Required for Clerk
			});

			if (!res.ok) throw new Error("Failed to fetch playlist");

			const data = await res.json();
			set({ currentPlaylist: data.playlist });

		} catch (err: any) {
			console.error("Failed to fetch playlist", err);
			set({ error: err.message });
		} finally {
			set({ isLoading: false });
		}
	},
	fetchSongsByIds: async (songs: any[]) => {
		try {
			const ids = songs.map((s) => typeof s === "string" ? s : s._id);

			if (!ids.length) {
				set({ playlistSongs: [] });
				return;
			}

			const res = await fetch(`http://localhost:5000/api/songs/by-ids?ids=${ids.join(",")}`, {
				credentials: "include",
			});

			if (!res.ok) throw new Error("Failed to fetch songs.");

			const songsData = await res.json();
			set({ playlistSongs: songsData });
		} catch (error) {
			console.error("Error fetching playlist songs:", error);
			set({ playlistSongs: [] });
		}
	},


	deleteSong: async (id) => {
		set({ isLoading: true, error: null });
		try {
			await axiosInstance.delete(`/admin/songs/${id}`);

			set((state) => ({
				songs: state.songs.filter((song) => song._id !== id),
			}));
			toast.success("Song deleted successfully");
		} catch (error: any) {
			console.log("Error in deleteSong", error);
			toast.error("Error deleting song");
		} finally {
			set({ isLoading: false });
		}
	},

	deleteAlbum: async (id) => {
		set({ isLoading: true, error: null });
		try {
			await axiosInstance.delete(`/admin/albums/${id}`);
			set((state) => ({
				albums: state.albums.filter((album) => album._id !== id),
				songs: state.songs.map((song) =>
					song.albumId === state.albums.find((a) => a._id === id)?.title ? { ...song, album: null } : song
				),
			}));
			toast.success("Album deleted successfully");
		} catch (error: any) {
			toast.error("Failed to delete album: " + error.message);
		} finally {
			set({ isLoading: false });
		}
	},

	fetchSongs: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs");

			set({ songs: normalizeSongs(response.data) });
		} catch (error: any) {
			set({ error: error.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchStats: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/stats");

			set({ stats: response.data });
		} catch (error: any) {
			set({ error: error.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchAlbums: async () => {
		set({ isLoading: true, error: null });

		try {
			const response = await axiosInstance.get("/albums");
			set({ albums: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchAlbumById: async (id) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get(`/albums/${id}`);
			set({ currentAlbum: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},
	fetchLikedSongs: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.get("http://localhost:5000/api/songs/liked", {
				withCredentials: true,
			});

			set({ likedSongs: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},
	fetchHistorySongs: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.get("http://localhost:5000/api/songs/history", {
				withCredentials: true,
			});

			set({ historySongs: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchFeaturedSongs: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.get("http://localhost:5000/api/songs/featured");
			console.log("featured", response.data);
			set({ featuredSongs: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchMadeForYouSongs: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("http://localhost:5000/api/songs/made-for-you");

			set({ madeForYouSongs: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchTrendingSongs: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.get("http://localhost:5000/api/songs/trending", {
				withCredentials: true,
			});

			set({ trendingSongs: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},

}));
const normalizeSongs = (songs: Song[]): Song[] =>
	songs.map(song => ({
		...song,
		likeCount: song.likeCount ?? 0,
		dislikeCount: song.dislikeCount ?? 0,
		likedByCurrentUser: song.likedByCurrentUser ?? false,
		dislikedByCurrentUser: song.dislikedByCurrentUser ?? false,
	}));
