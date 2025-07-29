import { SignedIn, useUser } from "@clerk/clerk-react";
import { HomeIcon, Library, SearchIcon, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";

const LeftSidebar = () => {
	const location = useLocation();
	const { user } = useUser();

	const isAdmin = user?.primaryEmailAddress?.emailAddress === "leengari76@gmail.com";

	return (
		<div className="h-full w-27 flex flex-col p-7">
			<ScrollArea className="flex-1 space-y-4">
				{/* Icon Navigation */}
				<div className="flex flex-col items-center gap-4 mx-auto">
					<Link
						to="/"
						className={`p-3 rounded-full ${location.pathname === "/" ? "bg-white text-black" : "hover:bg-zinc-700"} transition-colors`}
						title="Home"
						aria-label="Home"
						aria-current={location.pathname === "/" ? "page" : undefined}
					>
						<HomeIcon className="size-8" />
					</Link>

					<Link
						to="/search"
						className={`p-3 rounded-full ${location.pathname === "/search" ? "bg-white text-black" : "hover:bg-zinc-700"} transition-colors`}
						title="Search"
						aria-label="Search"
						aria-current={location.pathname === "/search" ? "page" : undefined}
					>
						<SearchIcon className="size-8" />
					</Link>

					<SignedIn>
						<Link
							to="/library"
							className={`p-3 rounded-full ${location.pathname === "/library" ? "bg-white text-black" : "hover:bg-zinc-700"} transition-colors`}
							title="Library"
							aria-label="Library"
							aria-current={location.pathname === "/library" ? "page" : undefined}
						>
							<Library className="size-8" />
						</Link>

						{isAdmin && (
							<Link
								to="/admin"
								className={`p-3 rounded-full ${location.pathname === "/admin" ? "bg-white text-black" : "hover:bg-zinc-700"} transition-colors`}
								title="Admin"
								aria-label="Admin"
								aria-current={location.pathname === "/admin" ? "page" : undefined}
							>
								<ShieldCheck className="size-8" />
							</Link>
						)}
					</SignedIn>
				</div>
			</ScrollArea>
		</div>
	);
};

export default LeftSidebar;
