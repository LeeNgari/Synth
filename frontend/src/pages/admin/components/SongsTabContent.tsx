import { Music } from "lucide-react";
import SongsTable from "./SongsTable";
import AddSongDialog from "./AddSongDialog";

const SongsTabContent = () => {
	return (
		<div>
			<div className='flex items-center justify-between mb-6'>
				<div>
					<h2 className='text-2xl font-bold flex items-center gap-2 text-white'>
						<Music className='size-5 text-white' />
						Songs Library
					</h2>
					<p className="text-white">Manage your music tracks</p>
				</div>
				<AddSongDialog />
			</div>
			<SongsTable />
		</div>
	);
};
export default SongsTabContent;
