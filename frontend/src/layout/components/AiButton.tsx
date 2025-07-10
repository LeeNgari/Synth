
interface AICoreButtonProps {
  toggleFriendsPanel: () => void;
  isActive: boolean;
}

const AICoreButton = ({ toggleFriendsPanel, isActive }: AICoreButtonProps) => {
  return (
    <button
      onClick={toggleFriendsPanel}
      title={isActive ? "Close AI Assistant" : "Open AI Assistant"}
      className=" z-50 group focus:outline-none"
    >
      <div className="relative w-16 h-16 rounded-full overflow-hidden">
        {/* Outer Pulsing Energy Aura */}
        <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-xl animate-aiPulse z-0" />

        {/* Hover Glow Ripple */}
        <div className="absolute inset-0 rounded-full bg-gradient-radial from-emerald-300/30 via-transparent to-transparent blur-md opacity-0 group-hover:opacity-100 group-hover:animate-aiRipple z-10 pointer-events-none" />

        {/* Click Flash / Core Shockwave */}
        <span className="absolute inset-0 rounded-full bg-emerald-500/10 opacity-0 group-active:animate-aiShock z-0" />

        {/* Inner Core */}
        <div className="relative z-20 flex items-center justify-center w-full h-full rounded-full bg-gradient-to-tr from-[#0f0c29] via-[#302b63] to-[#24243e] shadow-[0_0_30px_#10b98155] border border-emerald-400/50 group-hover:shadow-[0_0_50px_#10b981aa] group-active:scale-95 transition-all duration-300 ease-out">
          {/* Custom Futuristic AI Symbol */}
          <svg
            className="w-8 h-8 text-emerald-300 animate-aiPulseInner group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_#34d399] group-active:rotate-180 transition-all duration-500 ease-in-out"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M6.05 17.95l-1.414 1.414M17.95 17.95l-1.414-1.414M6.05 6.05L4.636 7.464"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
      </div>
    </button>
  );
};

export default AICoreButton;
