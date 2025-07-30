
import { cn } from "@/lib/utils";
import { Album, LayoutDashboard, ListMusic, Music, Users } from "lucide-react";

interface AdminSidebarProps {
    activeView: string;
    setView: (view: string) => void;
}

const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "songs", label: "Songs", icon: Music },
    { id: "albums", label: "Albums", icon: Album },
    { id: "playlists", label: "Playlists", icon: ListMusic },
    { id: "users", label: "Users", icon: Users },
];

const AdminSidebar = ({ activeView, setView }: AdminSidebarProps) => {
    return (
        <aside className="w-64 flex-shrink-0 bg-black/20 p-4 flex flex-col">
            <div className="text-2xl font-bold text-white mb-10 pl-2">Admin Menu</div>
            <nav className="flex flex-col space-y-2">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setView(item.id)}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                            "text-zinc-300 hover:bg-green-500/20 hover:text-white",
                            activeView === item.id && "bg-green-500/30 text-white"
                        )}
                    >
                        <item.icon className="size-5" />
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>
        </aside>
    );
};

export default AdminSidebar;
