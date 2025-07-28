import { create } from "zustand";
import { Song } from "@/types";
import axios from "axios";

interface PlayerStore {
	currentSong: Song | null;
	isPlaying: boolean;
	queue: Song[];
	currentIndex: number;

	initializeQueue: (songs: Song[]) => void;
	playAlbum: (songs: Song[], startIndex?: number) => void;
	setCurrentSong: (song: Song | null) => void;
	togglePlay: () => void;
	playNext: () => void;
	playPrevious: () => void;

	likeSong: (songId: string) => void;
	dislikeSong: (songId: string) => void;
	addToHistory: (songId: string) => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
	currentSong: null,
	isPlaying: false,
	queue: [],
	currentIndex: -1,

	initializeQueue: (songs: Song[]) => {
		set({
			queue: songs,
			currentSong: get().currentSong || songs[0],
			currentIndex: get().currentIndex === -1 ? 0 : get().currentIndex,
		});
	},

	playAlbum: async (songs: Song[], startIndex = 0) => {
		if (songs.length === 0) return;

		const song = songs[startIndex];



		console.log("add to history", song._id);
		get().addToHistory(song._id);

		set({
			queue: songs,
			currentSong: song,
			currentIndex: startIndex,
			isPlaying: true,
		});
	},

	setCurrentSong: async (song: Song | null) => {
		if (!song) return;



		console.log("add to history", song._id);

		get().addToHistory(song._id);

		const songIndex = get().queue.findIndex((s) => s._id === song._id);
		set({
			currentSong: song,
			isPlaying: true,
			currentIndex: songIndex !== -1 ? songIndex : get().currentIndex,
		});
	},

	togglePlay: () => {
		const willStartPlaying = !get().isPlaying;

		const currentSong = get().currentSong;


		set({
			isPlaying: willStartPlaying,
		});
	},

	playNext: () => {
		const { currentIndex, queue } = get();
		const nextIndex = currentIndex + 1;

		if (nextIndex < queue.length) {
			const nextSong = queue[nextIndex];


			console.log("add to history", nextSong._id);

			get().addToHistory(nextSong._id);

			set({
				currentSong: nextSong,
				currentIndex: nextIndex,
				isPlaying: true,
			});
		} else {
			set({ isPlaying: false });

		}
	},

	playPrevious: () => {
		const { currentIndex, queue } = get();
		const prevIndex = currentIndex - 1;

		if (prevIndex >= 0) {
			const prevSong = queue[prevIndex];


			console.log("add to history", prevSong._id);
			get().addToHistory(prevSong._id);

			set({
				currentSong: prevSong,
				currentIndex: prevIndex,
				isPlaying: true,
			});
		} else {
			set({ isPlaying: false });


		}
	},

	likeSong: async (songId: string) => {
        console.log("like song", songId);
        try {
            // Using original axios and adding withCredentials directly to the request
            await axios.post(`http://localhost:5000/api/songs/${songId}/like`, null, {
                withCredentials: true,
            });
        } catch (err) {
            console.error("Error liking song:", err);
        }
    },
    dislikeSong: async (songId: string) => {
        console.log("dislike song", songId);
        try {
            // Using original axios and adding withCredentials directly to the request
            await axios.post(`http://localhost:5000/api/songs/${songId}/dislike`, null, {
                withCredentials: true,
            });
        } catch (err) {
            console.error("Error disliking song:", err);
        }
    },
    addToHistory: async (songId: string) => {
        console.log("add to history", songId);
        try {
            // Using original axios and adding withCredentials directly to the request
            await axios.post(`http://localhost:5000/api/songs/history/${songId}`, null, {
                withCredentials: true,
            });
        } catch (err) {
            console.error("Error adding to history:", err);
        }
    }
}));
