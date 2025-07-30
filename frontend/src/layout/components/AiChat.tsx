
import { useState, useRef, useEffect } from "react";
import { Bot, User, Sparkles, Music, MessageSquare, Send, RotateCcw, Loader2 } from "lucide-react";
import axios from "axios";
import { Song } from "@/types";
import PlayButton from "@/pages/home/components/PlayButton";

interface Message {
	role: "user" | "ai";
	content: string;
	songs?: Song[];
}

export default function AiChat() {
	const [activeTab, setActiveTab] = useState<"music" | "chat">("music");
	const [messages, setMessages] = useState<Message[]>([]);
	const [chatHistory, setChatHistory] = useState<Message[]>([]);
	const [inputValue, setInputValue] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [promptHistory, setPromptHistory] = useState<string[]>([]);
	const chatEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(scrollToBottom, [messages, chatHistory, isLoading]);

	const handleSendMessage = async (prompt: string) => {
		if (!prompt.trim() || isLoading) return;

		const userMessage: Message = { role: "user", content: prompt };

		if (activeTab === "music") {
			setMessages((prev) => [...prev, userMessage]);
		} else {
			setChatHistory((prev) => [...prev, userMessage]);
		}

		setInputValue("");
		setIsLoading(true);

		if (activeTab === "music" && !promptHistory.includes(prompt)) {
			setPromptHistory((prev) => [prompt, ...prev].slice(0, 10));
		}

		try {
			if (activeTab === "music") {
				const res = await axios.post<{ songs: Song[] }>(
					"http://localhost:5000/api/ai/search",
					{ query: prompt },
					{ withCredentials: true }
				);

				const aiMessage: Message = {
					role: "ai",
					content:
						res.data.songs.length > 0
							? `Here are some songs that match your mood:`
							: "I couldn't find any songs for that. Try another prompt!",
					songs: res.data.songs,
				};
				setMessages((prev) => [...prev, aiMessage]);
			} else {
				const res = await axios.post<{ response: string }>(
					"http://localhost:5000/api/gemini/chat",
					{ prompt },
					{ withCredentials: true }
				);

				const aiMessage: Message = {
					role: "ai",
					content: res.data.response,
				};
				setChatHistory((prev) => [...prev, aiMessage]);
			}
		} catch (error) {
			const errorMessage: Message = {
				role: "ai",
				content: "Sorry, an error occurred. Please try again.",
			};
			if (activeTab === "music") {
				setMessages((prev) => [...prev, errorMessage]);
			} else {
				setChatHistory((prev) => [...prev, errorMessage]);
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage(inputValue);
		}
	};

	const clearChat = () => {
		if (activeTab === "music") {
			setMessages([]);
			setPromptHistory([]);
		} else {
			setChatHistory([]);
		}
	};

	const currentMessages = activeTab === "music" ? messages : chatHistory;

	return (
		<div className='w-[400px]  rounded-lg h-full bg-zinc-800/40 text-white flex flex-col absolute right-0 z-40 shadow-xl animate-fade-in border-l border-zinc-600/30 backdrop-blur-sm'>
			{/* Header */}
			<div className='p-6 border-b border-zinc-600/30 bg-gradient-to-r from-[#2e6f57]/40 to-transparent'>
				<h2 className='text-2xl font-bold flex items-center gap-2'>
					<Sparkles className='text-[#4fd1a5]' size={20} />
					<span className='bg-gradient-to-r from-[#4fd1a5] to-[#2e6f57] bg-clip-text text-transparent'>
						Aurora
					</span>
				</h2>
				<p className='text-sm text-zinc-300 mt-1 font-light'>Your AI music companion 🎧</p>
			</div>

			{/* Chat Area */}
			<div className='flex-1 overflow-y-auto px-6 py-6 space-y-6'>
				{currentMessages.length === 0 && !isLoading && (
					<div className="text-center text-zinc-400 h-full flex flex-col justify-center items-center">
						<Sparkles className="w-10 h-10 mb-4" />
						<p>Ask me to find music for you!</p>
						<p className="text-xs mt-2">e.g., "upbeat workout music" or "rainy day indie folk"</p>
					</div>
				)}
				{currentMessages.map((message, idx) => (
					<div key={idx} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
						<div
							className={`relative px-4 py-3 rounded-2xl text-sm max-w-[90%] shadow-md ${
								message.role === "user"
									? "bg-[#2e6f57] text-white"
									: "bg-zinc-700/80 border border-zinc-600/30"
							}`}
						>
							{message.role === "user" ? (
								<User className='absolute -left-7 top-2 text-[#4fd1a5]' size={18} />
							) : (
								<Bot className='absolute -left-7 top-2 text-[#4fd1a5]' size={18} />
							)}
							<p className="whitespace-pre-wrap">{message.content}</p>
							{message.songs && message.songs.length > 0 && (
								<ul className='mt-3 space-y-3'>
									{message.songs.map((song) => (
										<li
											key={song._id}
											className='flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-600/40 transition-colors group relative'
										>
											<img
												src={song.imageUrl}
												alt={song.title}
												className='size-10 rounded-md object-cover group-hover:opacity-80 transition-opacity'
												loading='lazy'
											/>
											<div className='flex-1 min-w-0'>
												<p className='text-zinc-100 font-medium truncate'>{song.title}</p>
												<p className='text-xs text-zinc-400 truncate'>{song.artist}</p>
											</div>
											<PlayButton song={song} />
										</li>
									))}
								</ul>
							)}
						</div>
					</div>
				))}
				{isLoading && (
					<div className='flex justify-start'>
						<div className='relative bg-zinc-700/80 border border-zinc-600/30 px-4 py-3 rounded-2xl text-sm max-w-[80%] shadow-lg'>
							<Bot className='absolute -left-7 top-2 text-[#4fd1a5]' size={18} />
							<div className='flex items-center gap-2 text-zinc-300'>
								<Loader2 className='animate-spin' size={16} />
								<span>Thinking...</span>
							</div>
						</div>
					</div>
				)}
				<div ref={chatEndRef} />
			</div>

			{/* Prompt History */}
			{activeTab === "music" && promptHistory.length > 0 && (
				<div className='px-4 pt-2 pb-2 border-t border-zinc-700/50'>
					<h3 className='text-xs font-semibold text-zinc-400 mb-2 px-2'>History</h3>
					<div className='flex flex-wrap gap-2'>
						{promptHistory.map((prompt, i) => (
							<button
								key={i}
								onClick={() => handleSendMessage(prompt)}
								className={`px-2 py-1 text-xs rounded-md transition-colors ${
									i === 0
										? "bg-zinc-600 text-white"
										: "bg-zinc-700 hover:bg-zinc-600 text-zinc-300"
								}`}
							>
								{prompt}
							</button>
						))}
					</div>
				</div>
			)}

			{/* Tab Buttons */}
			<div className="sticky bottom-0 left-0 p-4 bg-gradient-to-t from-zinc-800/90 to-transparent backdrop-blur-sm">
				<div className="flex gap-3">
					<button
						onClick={() => setActiveTab('music')}
						className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg shadow transition-all border ${activeTab === 'music'
								? 'bg-[#2e6f57] border-[#4fd1a5]/50 text-white'
								: 'bg-zinc-700 hover:bg-zinc-600/80 border-zinc-600/30 text-zinc-300'
							}`}
					>
						<Music size={16} />
						Music
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

			{/* Input Area */}
			<div className='p-4 border-t border-zinc-600/30 bg-zinc-800/80 backdrop-blur-sm'>
				<div className='flex gap-2'>
					<input
						type='text'
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder={activeTab === 'music' ? 'Describe the music you want...' : 'Ask me anything...'}
						className='flex-1 bg-zinc-700/80 border border-zinc-600/30 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4fd1a5]/50'
					/>
					<button
						onClick={() => handleSendMessage(inputValue)}
						disabled={isLoading || !inputValue.trim()}
						className='bg-[#4fd1a5] hover:bg-[#2e6f57] text-white p-2 rounded-lg shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
					>
						<Send size={18} />
					</button>
					<button
						onClick={clearChat}
						title="Clear chat history"
						className='bg-zinc-700 hover:bg-zinc-600 text-white p-2 rounded-lg shadow transition-colors'
					>
						<RotateCcw size={18} />
					</button>
				</div>
			</div>
		</div>
	);
}
