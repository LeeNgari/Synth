import { useSignIn } from "@clerk/clerk-react";
import { Button } from "./ui/button";

const SignInOAuthButtons = () => {
	const { signIn, isLoaded } = useSignIn();

	if (!isLoaded) return null;

	const signInWithGoogle = () => {
		signIn.authenticateWithRedirect({
			strategy: "oauth_google",
			redirectUrl: "/sso-callback",
			redirectUrlComplete: "/auth-callback",
		});
	};

	return (
		<div className="flex gap-4 justify-center">
			<Button
				onClick={signInWithGoogle}
				variant="secondary"
				className="flex items-center gap-2 px-6 py-3 bg-white text-black border border-zinc-300 rounded-xl shadow-sm hover:bg-zinc-100 transition-all"
			>
				Create Account
			</Button>

			<Button
				onClick={signInWithGoogle}
				variant="secondary"
				className="flex items-center gap-2 px-6 py-3 bg-black text-white border border-zinc-800 rounded-xl shadow-sm hover:bg-zinc-900 transition-all"
			>
				Sign In
			</Button>
		</div>
	);
};

export default SignInOAuthButtons;
