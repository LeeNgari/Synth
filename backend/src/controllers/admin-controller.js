import { song } from "../models/song-model.js";
import { album } from "../models/album-model.js";
import { user } from "../models/user-model.js";

import cloudinary from "../lib/cloudinary.js";

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Setup ES module-safe paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to your Python embedding script
const pythonScriptPath = path.resolve(
  __dirname,
  "../../../scripts/audio_embedding.py",
);

const uploadToCloudinary = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      resource_type: "auto",
    });
    return result.secure_url;
  } catch (error) {
    console.log("Error in uploadToCloudinary", error);
    throw new Error("Error uploading to cloudinary");
  }
};
export const createSong = async (req, res, next) => {
  try {
    if (!req.files || !req.files.audioFile || !req.files.imageFile) {
      return res.status(400).json({
        success: false,
        message: "Please upload an audio file and an image file",
      });
    }

    const { title, artist, albumId, duration } = req.body;
    const imageFile = req.files.imageFile;
    const audioFile = req.files.audioFile;

    // 1️⃣ Upload files to Cloudinary
    const audioUrl = await uploadToCloudinary(audioFile, "audio");
    const imageUrl = await uploadToCloudinary(imageFile, "image");

    // 2️⃣ Generate audio embedding via Python CLAP
    const embedding = await new Promise((resolve, reject) => {
      let result = "";

      const process = spawn(
        "/home/lee-ngari/project/synthprep/spotdl/venv/bin/python", // Python in venv
        [pythonScriptPath, audioUrl],
      );

      process.stdout.on("data", (data) => {
        result += data.toString();
      });

      process.stderr.on("data", (data) => {
        console.error("Python error:", data.toString());
      });

      process.on("close", (code) => {
        if (code !== 0) {
          return reject(new Error("Embedding script failed"));
        }
        try {
          resolve(JSON.parse(result)); // Expecting a 512-float array
        } catch (err) {
          reject(new Error("Failed to parse embedding"));
        }
      });
    });

    // 3️⃣ Save song to DB
    const newSong = await song.create({
      title,
      artist,
      album: albumId || null,
      duration,
      audioUrl,
      imageUrl,
      embedding,
    });

    // 4️⃣ If song belongs to an album, update album
    if (albumId) {
      await album.findByIdAndUpdate(albumId, {
        $push: { songs: newSong._id },
      });
    }

    res.status(201).json({
      success: true,
      message: "Song created successfully",
      song: newSong,
    });
  } catch (error) {
    console.error("Error creating song:", error);
    next(error);
  }
};

export const deleteSong = async (req, res, next) => {
  try {
    const { id } = req.params;

    const songDoc = await song.findById(id);
    if (!songDoc) {
      return res
        .status(404)
        .json({ success: false, message: "Song not found" });
    }

    if (songDoc.album) {
      // your schema calls it `album`, not albumId
      await album.findByIdAndUpdate(songDoc.album, {
        $pull: { songs: songDoc._id },
      });
    }

    await cloudinary.uploader.destroy(songDoc.audioUrl);
    await cloudinary.uploader.destroy(songDoc.imageUrl);
    await songDoc.deleteOne(); // updated for Mongoose 7+

    res
      .status(200)
      .json({ success: true, message: "Song deleted successfully" });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const createAlbum = async (req, res, next) => {
  try {
    const { title, artist, songs } = req.body;
    const { imageFile } = req.files;

    const imageUrl = await uploadToCloudinary(imageFile);

    const album = await album.create({
      title,
      artist,
      imageUrl,
      releaseYear,
    });

    await album.save();
    res
      .status(201)
      .json({ success: true, message: "Album created successfully" });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
export const deleteAlbum = async (req, res, next) => {
  try {
    const { id } = req.params;
    await song.deleteMany({ albumId: id });
    await album.findByIdAndDelete(id);
    res
      .status(200)
      .json({ success: true, message: "Album deleted successfully" });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role specified" });
    }

    const updatedUser = await user.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "User role updated successfully", user: updatedUser });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
