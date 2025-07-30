import { useAuthStore } from "@/stores/useAuthStore";
import DashboardStats from "./components/DashboardStats";
import { Album, Music, ListMusic, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SongsTabContent from "./components/SongsTabContent";
import AlbumsTabContent from "./components/AlbumsTabContent";
import { useEffect } from "react";
import { useMusicStore } from "@/stores/useMusicStore";
import PlaylistsTabContent from "./components/PlaylistsTabContent";
import UsersTabContent from "./components/UsersTabContent";

const AdminPage = () => {
	const { isAdmin, isLoading } = useAuthStore();

	const { fetchAlbums, fetchSongs, fetchStats } = useMusicStore();

	useEffect(() => {
		fetchAlbums();
		fetchSongs();
		fetchStats();
	}, [fetchAlbums, fetchSongs, fetchStats]);

	if (!isAdmin && !isLoading) return <div>Unauthorized</div>;

	return (
		<div className='min-h-screen bg-[#2e6f57] text-white p-4 sm:p-6'>
			<h1 className='text-2xl sm:text-3xl font-bold mb-6'>Admin Dashboard</h1>
			<DashboardStats />

			<Tabs defaultValue='songs' className='space-y-6'>
				<TabsList className='grid w-full grid-cols-4 p-1 bg-white'>
					<TabsTrigger value='songs' className='data-[state=active]:bg-[#2e6f57]'>
						<Music className='mr-2 size-4' />
						Songs
					</TabsTrigger>
					<TabsTrigger value='albums' className='data-[state=active]:bg-[#2e6f57]'>
						<Album className='mr-2 size-4' />
						Albums
					</TabsTrigger>
					<TabsTrigger value='playlists' className='data-[state=active]:bg-[#2e6f57]'>
						<ListMusic className='mr-2 size-4' />
						Playlists
					</TabsTrigger>
					<TabsTrigger value='users' className='data-[state=active]:bg-[#2e6f57]'>
						<Users className='mr-2 size-4' />
						Users
					</TabsTrigger>
				</TabsList>

				<TabsContent value='songs'>
					<SongsTabContent />
				</TabsContent>
				<TabsContent value='albums'>
					<AlbumsTabContent />
				</TabsContent>
				<TabsContent value='playlists'>
					<PlaylistsTabContent />
				</TabsContent>
				<TabsContent value='users'>
					<UsersTabContent />
				</TabsContent>
			</Tabs>
		</div>
	);
};
export default AdminPage;
