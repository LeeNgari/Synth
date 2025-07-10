import { useState } from 'react';
import { Bot, User, Sparkles, Music, MessageSquare } from "lucide-react";

export default function AiSidebar() {
	const [activeTab, setActiveTab] = useState<'playlist' | 'chat'>('playlist');
	const [messages, setMessages] = useState([
		{ role: 'user', content: 'Hey Aurora, can you suggest some upbeat songs for my morning workout?' },
		{
			role: 'ai',
			content: "Absolutely! Here's a high-energy playlist to get your morning going:",
			playlist: [
				{ name: "Blinding Lights – The Weeknd", img: "https://i.scdn.co/image/ab67616d00001e028b17166113b7cae61ccf3653" },
				{ name: "Uptown Funk – Mark Ronson ft. Bruno Mars", img: "https://i.scdn.co/image/ab67616d00001e02422731853a812674e50337b5" },
				{ name: "Don't Start Now – Dua Lipa", img: "https://i.scdn.co/image/ab67616d00001e02a0a256a4270d4c82b0e9a7e6" },
			]
		},
		{ role: 'user', content: 'That’s a great start! Who is the lead singer of Fleetwood Mac?' },
		{
			role: 'ai',
			content: "Fleetwood Mac actually has two prominent lead female vocalists: **Stevie Nicks** and **Christine McVie**. Lindsey Buckingham also shared lead male vocals and guitar duties."
		},
		{ role: 'user', content: 'Can you recommend some indie artists similar to Bon Iver or Fleet Foxes?' },
		{
			role: 'ai',
			content: "If you enjoy Bon Iver and Fleet Foxes, you might like these indie folk artists:",
			playlist: [
				{ name: "Holocene – Bon Iver", img: "https://i.scdn.co/image/ab67616d00001e02c77d61b34a65492211993214" },
				{ name: "White Winter Hymnal – Fleet Foxes", img: "https://i.scdn.co/image/ab67616d00001e021a2c9ac2d39bc5c2e22b9555" },
				{ name: "The Sound of Silence (acoustic) – Simon & Garfunkel", img: "https://i.scdn.co/image/ab67616d00001e02f9e42e7c4f42b3d1b3e8e8e8" },
			]
		},
		{ role: 'user', content: 'Tell me more about the genre of ambient music.' },
		{
			role: 'ai',
			content: "Ambient music is a genre characterized by its atmospheric, unobtrusive, and environmental qualities. It often lacks traditional melodic structures or strong rhythms, focusing instead on texture, tone, and overall soundscapes. It's designed to evoke a sense of calm or contemplation rather than active listening."
		},
		{ role: 'user', content: 'Play something relaxing for studying.' },
		{
			role: 'ai',
			content: "Here’s a calming selection perfect for focus and relaxation:",
			playlist: [
				{ name: "Nuvole Bianche – Ludovico Einaudi", img: "https://i.scdn.co/image/ab67616d00001e0276d491c6e1e8b2b7a9e3d9f2" },
				{ name: "Experience – Ludovico Einaudi", img: "https://i.scdn.co/image/ab67616d00001e0276d491c6e1e8b2b7a9e3d9f2" },
				{ name: "Clair de Lune – Claude Debussy", img: "https://i.scdn.co/image/ab67616d00001e02d8b4f1b2c3a4d5e6f7a8b9c0" },
			]
		},
	]);
	const [inputValue, setInputValue] = useState('');

	const handleSendMessage = () => {
		if (inputValue.trim()) {
			setMessages([...messages, { role: 'user', content: inputValue }]);
			// Simulate AI response
			setTimeout(() => {
				setMessages(prev => [...prev, {
					role: 'ai',
					content: `I've updated your playlist based on: "${inputValue}"`
				}]);
			}, 800);
			setInputValue('');
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	return (
		<div className="w-[400px] rounded-lg h-full bg-zinc-800/40 text-white flex flex-col absolute right-0 z-40 shadow-xl animate-fade-in border-l border-zinc-600/30 backdrop-blur-sm">
			{/* Header */}
			<div className="p-6 border-b border-zinc-600/30 bg-gradient-to-r from-[#2e6f57]/40 to-transparent">
				<h2 className="text-2xl font-bold flex items-center gap-2">
					<Sparkles className="text-[#4fd1a5]" size={20} />
					<span className="bg-gradient-to-r from-[#4fd1a5] to-[#2e6f57] bg-clip-text text-transparent">
						Aurora
					</span>
				</h2>
				<p className="text-sm text-zinc-300 mt-1 font-light">
					Your AI music companion 🎧
				</p>
			</div>

			{/* Content Area */}
			<div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
				{activeTab === 'playlist' ? (
					<>
						{/* User Message */}
						<div className="flex justify-end">
							<div className="relative bg-[#2e6f57] text-white px-4 py-3 rounded-2xl text-sm max-w-[80%] shadow-md hover:scale-[1.02] transition-transform">
								<User className="absolute -left-6 top-2 text-[#4fd1a5]" size={18} />
								Create a chill playlist for a rainy day.
							</div>
						</div>

						{/* AI Response */}
						<div className="flex justify-start">
							<div className="relative bg-zinc-700/80 border border-zinc-600/30 px-4 py-3 rounded-2xl text-sm max-w-[80%] shadow-lg hover:scale-[1.01] transition-transform">
								<Bot className="absolute -left-6 top-2 text-[#4fd1a5]" size={18} />
								Here's a playlist I think you'll love:
								<ul className="mt-3 space-y-3">
									{[
										{
											name: "Stick Season – Noah Kahan",
											img: "https://i.scdn.co/image/ab67616d00001e026ee35072df1af802cca09918",
										},
										{
											name: "Pink Skies – Zach Bryan",
											img: "https://i.scdn.co/image/ab67616d00001e021a2c9ac2d39bc5c2e22b9555",
										},
										{
											name: "Beautiful Things – Benson Boone",
											img: "https://i.scdn.co/image/ab67616d00001e02cc04ff3e70e146ba9abacf40",
										},
									].map((track, idx) => (
										<li
											key={idx}
											className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-600/40 transition-colors group"
										>
											<div className="relative">
												<img
													src={track.img}
													alt={track.name}
													className="size-10 rounded-md object-cover group-hover:opacity-80 transition-opacity"
													loading="lazy"
												/>
												<div className="absolute inset-0 bg-[#4fd1a5]/20 rounded-md opacity-0 group-hover:opacity-100 transition-opacity" />
											</div>
											<span className="text-zinc-100 font-medium">{track.name}</span>
										</li>
									))}
								</ul>
								<div className="mt-3 flex justify-end">
									<button className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 text-xs font-medium rounded-lg shadow-md transition-all hover:scale-105">
										Finalize Playlist
									</button>
								</div>
							</div>
						</div>
					</>
				) : (
					<div className="space-y-4">
						{messages.map((message, idx) => (
							<div key={idx} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
								<div className={`relative px-4 py-3 rounded-2xl text-sm max-w-[80%] shadow-md hover:scale-[1.01] transition-transform ${message.role === 'user'
										? 'bg-[#2e6f57] text-white'
										: 'bg-zinc-700/80 border border-zinc-600/30'
									}`}>
									{message.role === 'user' ? (
										<User className="absolute -left-6 top-2 text-[#4fd1a5]" size={18} />
									) : (
										<Bot className="absolute -left-6 top-2 text-[#4fd1a5]" size={18} />
									)}
									{message.content}
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Input Area - Only shown in chat mode */}
			{activeTab === 'chat' && (
				<div className="p-4 border-t border-zinc-600/30 bg-zinc-800/80 backdrop-blur-sm">
					<div className="flex gap-2">
						<input
							type="text"
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder="Type your message..."
							className="flex-1 bg-zinc-700/80 border border-zinc-600/30 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4fd1a5]/50"
						/>
						<button
							onClick={handleSendMessage}
							className="bg-[#4fd1a5] hover:bg-[#2e6f57] text-white px-4 py-2 rounded-lg shadow transition-colors"
						>
							Send
						</button>
					</div>
				</div>
			)}

			{/* Tab Buttons */}
			<div className="sticky bottom-0 left-0 p-4 bg-gradient-to-t from-zinc-800/90 to-transparent backdrop-blur-sm">
				<div className="flex gap-3">
					<button
						onClick={() => setActiveTab('playlist')}
						className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg shadow transition-all border ${activeTab === 'playlist'
								? 'bg-[#2e6f57] border-[#4fd1a5]/50 text-white'
								: 'bg-zinc-700 hover:bg-zinc-600/80 border-zinc-600/30 text-zinc-300'
							}`}
					>
						<Music size={16} />
						Playlist
					</button>
					<button
						onClick={() => setActiveTab('chat')}
						className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg shadow transition-all border ${activeTab === 'chat'
								? 'bg-[#2e6f57] border-[#4fd1a5]/50 text-white'
								: 'bg-zinc-700 hover:bg-zinc-600/80 border-zinc-600/30 text-zinc-300'
							}`}
					>
						<MessageSquare size={16} />
						Chat
					</button>
				</div>
			</div>
		</div>
	);
}