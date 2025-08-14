import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { Plus, Upload } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

const AddAlbumDialog = () => {
  const [albumDialogOpen, setAlbumDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newAlbum, setNewAlbum] = useState({
    title: "",
    artist: "",
    releaseYear: new Date().getFullYear(),
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      if (!imageFile) {
        return toast.error("Please upload an image");
      }

      const formData = new FormData();
      formData.append("title", newAlbum.title);
      formData.append("artist", newAlbum.artist);
      formData.append("releaseYear", newAlbum.releaseYear.toString());
      formData.append("imageFile", imageFile);

      await axios.post("http://localhost:5000/api/admin/albums", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      setNewAlbum({
        title: "",
        artist: "",
        releaseYear: new Date().getFullYear(),
      });
      setImageFile(null);
      setAlbumDialogOpen(false);
      toast.success("Album created successfully");
    } catch (error: any) {
      toast.error("Failed to create album: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={albumDialogOpen} onOpenChange={setAlbumDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-white text-black hover:bg-zinc-200">
          <Plus className="mr-2 h-4 w-4" />
          Add Album
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-zinc-900 border border-zinc-700 max-h-[80vh] overflow-auto rounded-xl shadow-lg w-[800px]">
        <DialogHeader>
          <DialogTitle className="text-white">Add New Album</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Add a new album to your collection
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Artwork Upload */}
          <div
            className="flex items-center justify-center p-6 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-white/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
            <div className="text-center">
              {imageFile ? (
                <div className="space-y-2">
                  <div className="text-sm text-white">Image selected:</div>
                  <div className="text-xs text-zinc-400">
                    {imageFile.name.slice(0, 30)}
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-zinc-800 rounded-full inline-block mb-2">
                    <Upload className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-sm text-zinc-300 mb-2">
                    Upload album artwork
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs border-zinc-700 text-white hover:bg-zinc-700"
                  >
                    Choose File
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Album Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Album Title
            </label>
            <Input
              value={newAlbum.title}
              onChange={(e) =>
                setNewAlbum({ ...newAlbum, title: e.target.value })
              }
              className="bg-zinc-800 border-zinc-700 text-white"
              placeholder="Enter album title"
            />
          </div>

          {/* Artist */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Artist</label>
            <Input
              value={newAlbum.artist}
              onChange={(e) =>
                setNewAlbum({ ...newAlbum, artist: e.target.value })
              }
              className="bg-zinc-800 border-zinc-700 text-white"
              placeholder="Enter artist name"
            />
          </div>

          {/* Release Year */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Release Year
            </label>
            <Input
              type="number"
              value={newAlbum.releaseYear}
              onChange={(e) =>
                setNewAlbum({
                  ...newAlbum,
                  releaseYear: parseInt(e.target.value) || "",
                })
              }
              className="bg-zinc-800 border-zinc-700 text-white"
              placeholder="Enter release year"
              min={1900}
              max={new Date().getFullYear()}
            />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => setAlbumDialogOpen(false)}
            disabled={isLoading}
            className="border-zinc-700 text-white hover:bg-zinc-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-white text-black hover:bg-zinc-200"
            disabled={
              isLoading || !imageFile || !newAlbum.title || !newAlbum.artist
            }
          >
            {isLoading ? "Creating..." : "Add Album"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default AddAlbumDialog;
