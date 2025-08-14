import { cn } from "@/lib/utils";
import { Album, ListMusic, Music, Users } from "lucide-react";

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
    <header className="w-full h-20 px-6 flex items-center border-b border-white/10">
      <div className="text-xl font-bold text-white mr-10">Admin Panel</div>
      <nav className="flex items-center gap-6">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className="flex flex-col items-center gap-1 group"
            title={item.label}
            aria-label={item.label}
            aria-current={activeView === item.id ? "page" : undefined}
          >
            <div
              className={cn(
                "p-3 rounded-full transition-colors",
                activeView === item.id
                  ? "bg-white text-black"
                  : "text-white hover:bg-zinc-700",
              )}
            >
              <item.icon className="size-6" />
            </div>
            <span
              className={cn(
                "text-xs font-medium transition-colors",
                activeView === item.id
                  ? "text-white"
                  : "text-zinc-400 group-hover:text-white",
              )}
            >
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </header>
  );
};

export default AdminHeader;
