import { cn } from "@/lib/utils";
import { Album, LayoutDashboard, ListMusic, Music, Users } from "lucide-react";

interface AdminHeaderProps {
    activeView: string;
    setView: (view: string) => void;
}

const navItems = [
    { id: "songs", label: "Songs", icon: Music },
    { id: "albums", label: "Albums", icon: Album },
    { id: "playlists", label: "Playlists", icon: ListMusic },
    { id: "users", label: "Users", icon: Users },
];

const AdminHeader = ({ activeView, setView }: AdminHeaderProps) => {
    return (
        <header className="w-full h-16 bg-black/20 px-6 flex items-center border-b border-white/10">
            <div className="text-xl font-bold text-white mr-10">Admin Panel</div>
            <nav className="flex items-center space-x-1">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setView(item.id)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                            "text-zinc-300 hover:bg-green-500/20 hover:text-white",
                            activeView === item.id && "bg-green-500/30 text-white"
                        )}
                    >
                        <item.icon className="size-4" />
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>
        </header>
    );
};

export default AdminHeader;