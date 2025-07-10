import {song} from "../models/song-model.js";
import {album} from "../models/album-model.js";

import cloudinary from "../lib/cloudinary.js";


const uploadToCloudinary = async (file) => {
    try{
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            resource_type: "auto",
        });
     return result.secure_url;
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        throw new Error("Failed to upload file");
    }
};

export const createSong = async (req, res, next) => {
    try {

        if(!req.files || !req.files.audioFile || !req.files.imageFile) {
            return req.status(400).json({ success: false, message: "Please upload an audio file and an image file" });
        }
        const { title, artist, albumId, duration} = req.body;
        const imageFile  = req.files.imageFile;
        const audioFile = req.files.audioFile;

        const audioUrl = await uploadToCloudinary(audioFile);
        const imageUrl = await uploadToCloudinary(imageFile);

        const song = await song.create({
            title,
            artist,
            albumId: albumId || null,
            duration,
            audioUrl,
            imageUrl
        });
        
        //if song belongs to an album, update albums songs array
        await song.save();
        if(albumId){
            await album.findByIdAndUpdate(albumId, {
                $push: { songs: song._id }
            });
        }
       
        res.status(201).json({ success: true, message: "Song created successfully", song: newSong });
    } catch (error) {
        console.error(error);
        next(error);
    }
}

export const deleteSong = async (req, res, next) => {

    try { 
        const { id } = req.params;
        const song = await song.findById(id);
        if (!song) {
            return res.status(404).json({ success: false, message: "Song not found" });
        }
        if (song.albumId) {
            await album.findByIdAndUpdate(song.albumId, {
                $pull: { songs: song._id }
            });
        }
        await cloudinary.uploader.destroy(song.audioUrl);
        await cloudinary.uploader.destroy(song.imageUrl);
        await song.remove();
        res.status(200).json({ success: true, message: "Song deleted successfully" });
    }
    catch (error) {
        console.error(error);
        next(error);
    }
}
export const createAlbum = async (req, res, next) => {
    try{
     const { title, artist, songs } = req.body;
     const { imageFile } = req.files;

     const imageUrl = await uploadToCloudinary(imageFile);

     const album = await album.create({
         title,
         artist,
         imageUrl,
         releaseYear
     });

     await album.save();
     res.status(201).json({ success: true, message: "Album created successfully" });
    }catch (error) {
        console.error(error);
        next(error);
    }
}
export const deleteAlbum = async (req, res, next) => {
    try{
        const { id } = req.params;
        await song.deleteMany({ albumId: id });
        await await album.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Album deleted successfully" });
    } catch (error) {
        console.error(error);
        next(error);
    }
}
export const checkAdmin = async (req, res, next) => {
    res.status(200).json({ admin:true });
}