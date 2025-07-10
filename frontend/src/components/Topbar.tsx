import { SignedOut, UserButton } from "@clerk/clerk-react";
import SignInOAuthButtons from "./SignInOAuthButtons";
import Logo from "../assets/Screenshot from 2025-07-08 17-46-04.png";

const Topbar = () => {
	return (
		<div className="flex w-full items-center justify-between px-4 sm:px-6 py-6 sticky top-0 z-10 bg-[#2e6f57]">
			{/* Logo Section */}
			<div className="flex items-center h-full gap-4">
				<a href="/" aria-label="Synth Home">
					<img src={Logo} className="size-12 object-contain" alt="Synth logo" />
				</a>
				<span className="hidden sm:inline text-2xl font-bold text-white">SYNTH</span>
			</div>

			{/* Right Actions */}
			<div className="flex items-center gap-4">
				<SignedOut>
					<SignInOAuthButtons />
				</SignedOut>
				<UserButton />
			</div>
		</div>
	);
};

export default Topbar;