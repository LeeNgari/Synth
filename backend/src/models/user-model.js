import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  imageUrl: { type: String, required: true },
  clerkId: { type: String, required: true, unique: true },

  likedSongs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
  dislikedSongs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
  listeningHistory: [{
    song: { type: mongoose.Schema.Types.ObjectId, ref: 'Song' },
    listenedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export const user = mongoose.model('User', userSchema);
