import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const MONGO_URI = "mongodb+srv://leengari76:4nGrnkJAznFGGBfN@cluster0.mwhdd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Step 1: Connect FIRST, then load models
const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            maxPoolSize: 3,
            connectTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            serverSelectionTimeoutMS: 30000,
        });

        // Ensure connection is really ready
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('readyState timeout')), 10000);
            const check = () => {
                if (mongoose.connection.readyState === 1) {
                    clearTimeout(timeout);
                    resolve();
                } else {
                    setTimeout(check, 100);
                }
            };
            check();
        });

        console.log("✅ Fully connected to MongoDB");
    } catch (err) {
        console.error("❌ Failed to connect:", err.message);
        process.exit(1);
    }
};

let song, album;

// Step 2: Define models AFTER connect()
const loadModels = () => {
    const songSchema = new mongoose.Schema({
        title: { type: String, required: true },
        artist: { type: String, required: true },
        album: { type: mongoose.Schema.Types.ObjectId, ref: 'Album' },
        duration: Number,
        releaseDate: Date,
        popularity: Number,
        audioUrl: String,
        imageUrl: String,
        embedding: [Number],
        likesCount: { type: Number, default: 0 },
        dislikesCount: { type: Number, default: 0 }
    });
    song = mongoose.model('Song', songSchema);

    const albumSchema = new mongoose.Schema({
        title: { type: String, required: true },
        artist: { type: String, required: true },
        releaseDate: Date,
        imageUrl: String,
        songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }]
    });
    album = mongoose.model('Album', albumSchema);
};

async function processSong(songData) {
    const { album: albumTitle, artist, release_date, album_art } = songData;

    // Separate read/insert
    let albumDoc = await album.findOne({ title: albumTitle, artist });

    if (!albumDoc) {
        try {
            albumDoc = await album.create({
                title: albumTitle,
                artist,
                releaseDate: new Date(release_date),
                imageUrl: album_art,
                songs: []
            });
        } catch {
            albumDoc = await album.findOne({ title: albumTitle, artist });
        }
    }

    const exists = await song.findOne({ title: songData.title, artist });
    if (exists) {
        console.log(`⚠️ Skipped duplicate: ${songData.title}`);
        return;
    }

    const createdSong = await song.create({
        title: songData.title,
        artist,
        album: albumDoc._id,
        duration: Math.round(songData.duration_ms / 1000),
        releaseDate: new Date(songData.release_date),
        popularity: songData.popularity,
        audioUrl: songData.cloudinary_url,
        imageUrl: songData.album_art,
        embedding: songData.embedding || []
    });

    await album.updateOne({ _id: albumDoc._id }, { $addToSet: { songs: createdSong._id } });
}

async function uploadSongs() {
    const rawData = fs.readFileSync(path.resolve('./songs_with_embeddings.json'), 'utf-8');
    const songs = JSON.parse(rawData);

    console.log(`📦 Found ${songs.length} songs to upload`);

    for (let i = 0; i < songs.length; i++) {
        const songData = songs[i];
        const start = Date.now();
        console.log(`🎵 Processing ${i + 1}/${songs.length}: ${songData.title}`);

        try {
            await processSong(songData);
            const duration = ((Date.now() - start) / 1000).toFixed(1);
            console.log(`✅ Done in ${duration}s`);
        } catch (err) {
            console.error(`❌ Error uploading "${songData.title}": ${err.message}`);
        }

        if ((i + 1) % 5 === 0) {
            console.log('⏳ Cooling down for 5s...\n');
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

(async () => {
    await connectDB();
    loadModels(); // 🚨 Load models only after connection
    await uploadSongs();
    await mongoose.disconnect();
    process.exit();
})();
