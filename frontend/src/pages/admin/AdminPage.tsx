import { useAuthStore } from "@/stores/useAuthStore";
import DashboardStats from "./components/DashboardStats";
import SongsTabContent from "./components/SongsTabContent";
import AlbumsTabContent from "./components/AlbumsTabContent";
import { useEffect, useState } from "react";
import { useMusicStore } from "@/stores/useMusicStore";
import PlaylistsTabContent from "./components/PlaylistsTabContent";
import UsersTabContent from "./components/UsersTabContent";
import AdminSidebar from "./components/AdminSidebar";

const AdminPage = () => {
    const { isAdmin, isLoading } = useAuthStore();
    const [activeView, setActiveView] = useState("songs");

    const { fetchAlbums, fetchSongs, fetchStats } = useMusicStore();

    useEffect(() => {
        fetchAlbums();
        fetchSongs();
        fetchStats();
    }, [fetchAlbums, fetchSongs, fetchStats]);

    if (!isAdmin && !isLoading) return <div>Unauthorized</div>;

    const renderContent = () => {
        switch (activeView) {
            case "songs":
                return <SongsTabContent />;
            case "albums":
                return <AlbumsTabContent />;
            case "playlists":
                return <PlaylistsTabContent />;
            case "users":
                return <UsersTabContent />;
            default:
                return <DashboardStats />;
        }
    };

    return (
        <div className='min-h-screen bg-[#2e6f57] text-white'>
            <AdminSidebar activeView={activeView} setView={setActiveView} />
            <main className="flex-1 p-8">
                {renderContent()}
            </main>
        </div>
    );
};
export default AdminPage;
