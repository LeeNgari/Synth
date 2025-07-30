import { Library } from "lucide-react";
import AlbumsTable from "./AlbumsTable";
import AddAlbumDialog from "./AddAlbumDialog";

const AlbumsTabContent = () => {
	return (
		<div>
			<div className='flex items-center justify-between mb-6'>
				<div>
					<h2 className='text-2xl font-bold flex items-center gap-2'>
						<Library className='text-white' />
						Albums Library
					</h2>
					<p className="text-white">Manage your album collection</p>
				</div>
				<AddAlbumDialog />
			</div>
			<AlbumsTable />
		</div>
	);
};
export default AlbumsTabContent;
