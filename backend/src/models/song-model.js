import mongoose from 'mongoose';

const songSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  audioUrl: { type: String, required: true }, // e.g. Cloudinary URL
  duration: { type: Number, required: true }, // seconds
  album: { type: mongoose.Schema.Types.ObjectId, ref: 'Album' },
  imageUrl: { type: String, required: true }, // album art
  releaseDate: { type: Date },
  popularity: { type: Number, default: 0 },

  // Vector embedding (CLAP: 512 floats)
  embedding: {
    type: [Number],
    validate: arr => arr.length === 512
  },

  // Like/dislike counters
  likesCount: { type: Number, default: 0 },
  dislikesCount: { type: Number, default: 0 }
}, { timestamps: true });

export const song = mongoose.model('Song', songSchema);
