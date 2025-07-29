import { Outlet } from "react-router-dom";
import Topbar from "../components/Topbar";
import LeftSidebar from "./components/LeftSidebar";
import AiChat from "./components/AiChat";
import AudioPlayer from "./components/AudioPlayer";
import { PlaybackControls } from "./components/PlaybackControls";
import { useEffect, useState } from "react";

const MainLayout = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isFriendsPanelOpen, setIsFriendsPanelOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleFriendsPanel = () => setIsFriendsPanelOpen((prev) => !prev);

  return (
    <div className="h-screen flex flex-col bg-[#2e6f57] text-white">
      {/* Header */}
      <header className="w-full flex justify-between items-center px-4 py-2 ">
        <Topbar />
      </header>

      <AudioPlayer />

      {/* Body layout */}
      <main className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Main Content */}
        <section
          className={`flex-1 overflow-y-auto transition-all duration-300 ${isFriendsPanelOpen && !isMobile ? "pr-[400px]" : ""
            }`}
        >
          <Outlet />
        </section>

        {/* AiSidebar */}
        {!isMobile && isFriendsPanelOpen && (
          <div className="absolute right-0 top-0 h-full">
            <AiChat />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer>
        <PlaybackControls
          toggleFriendsPanel={toggleFriendsPanel}
          isFriendsPanelOpen={isFriendsPanelOpen}
        />
      </footer>
    </div>
  );
};

export default MainLayout;