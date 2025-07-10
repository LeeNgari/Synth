import { Card, CardContent } from "@/components/ui/card";
import { axiosInstance } from "@/lib/axios";
import { useUser } from "@clerk/clerk-react";
import { Loader } from "lucide-react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const AuthCallbackPage = () => {
	const { isLoaded, user } = useUser();
	const navigate = useNavigate();
	const syncAttempted = useRef(false);

	useEffect(() => {
		console.log("Initial state", { isLoaded, user, syncAttempted: syncAttempted.current });

		const syncUser = async () => {
			if (!isLoaded) {
				console.log("Clerk not loaded yet");
				return;
			}
			if (!user) {
				console.log("No user found");
				return;
			}
			if (syncAttempted.current) {
				console.log("Sync already attempted");
				return;
			}

			syncAttempted.current = true;
			console.log("Attempting to sync user...");

			try {
				const response = await axiosInstance.post("/auth/callback", {
					id: user.id,
					firstName: user.firstName,
					lastName: user.lastName,
					imageUrl: user.imageUrl,
				}, {
					withCredentials: true // Important for sessions
				});
				console.log("Sync response:", response.data);
			} catch (error) {
				console.error("Sync failed:", error);
			} finally {
				navigate("/");
			}
		};

		syncUser();
	}, [isLoaded, user, navigate]);

	return (
		<div className="h-screen w-full bg-[#2e6f57] flex items-center justify-center">
			<div className="w-[90%] max-w-sm bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg">
				<div className="flex flex-col items-center gap-6 px-4 py-8" aria-live="polite" aria-label="Loading, please wait">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
					<h3 className="text-xl font-bold text-white">Logging you in</h3>
					<p className="text-sm text-zinc-400">Redirecting...</p>
				</div>
			</div>
		</div>
	);
};
export default AuthCallbackPage;
