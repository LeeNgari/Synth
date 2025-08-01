import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import AuthCallbackPage from "./pages/auth-callback/AuthCallbackPage";
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import MainLayout from "./layout/MainLayout";
import SearchPage from "./pages/search/search";
import AlbumPage from "./pages/album/AlbumPage";
import LibraryPage from "./pages/library/LibraryPage"
import AdminPage from "./pages/admin/AdminPage";
import PlaylistPage from "./pages/playlists/PlaylistPage";
import { Toaster } from "react-hot-toast";
import NotFoundPage from "./pages/404/NotFoundPage";

function App() {
	return (
		<>
			<Routes>
				<Route
					path='/sso-callback'
					element={<AuthenticateWithRedirectCallback signUpForceRedirectUrl={"/auth-callback"} />}
				/>
				<Route path='/auth-callback' element={<AuthCallbackPage />} />

				<Route element={<MainLayout />}>
					<Route path='/' element={<HomePage />} />
					<Route path='/search' element={<SearchPage />} />
					<Route path='/library' element={<LibraryPage />} />
					<Route path='/albums/:albumId' element={<AlbumPage />} />
					<Route path='/playlists/:playlistId' element={<PlaylistPage />} />
					<Route path='/admin' element={<AdminPage />} />
					<Route path='*' element={<NotFoundPage />} />
				</Route>
			</Routes>
			<Toaster />
		</>
	);
}

export default App;
