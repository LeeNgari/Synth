import { configDotenv } from "dotenv";
configDotenv()

import { clerkMiddleware } from "@clerk/express"
import fileUpload from "express-fileupload"
import path from 'path';

import userRoutes from "./routes/user-route.js"
import authRoutes from "./routes/auth-route.js"
import adminRoutes from "./routes/admin-route.js"
import songRoutes from "./routes/song-route.js"
import albumRoutes from "./routes/album-route.js"
import statRoutes from "./routes/stat-route.js"
import playlistRoutes from "./routes/playlist-routes.js"
import aiRoutes from "./routes/ai-route.js"
import geminiRoutes from "./routes/gemini-route.js"
import { create } from 'domain';

import express from 'express';
import cors from "cors"



import { connectDB } from "./lib/db.js"

const app = express()
const PORT = process.env.PORT || 5000
const __dirname = path.resolve()


app.use(cors({
    origin: 'http://localhost:3000', // or use '*' to allow all origins (not recommended for production)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json())


app.use(clerkMiddleware())

app.use(fileUpload({
    tempFileDir: path.join(__dirname, "tmp"),
    createParentPath: true,
    limits: { fileSize: 10 * 1024 * 1024 },
}))


app.use("/api/users", userRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/songs", songRoutes)
app.use("/api/albums", albumRoutes)
app.use("/api/stats", statRoutes)
app.use("/api/playlists", playlistRoutes)
app.use("/api/ai", aiRoutes)
app.use("/api/gemini", geminiRoutes)

app.use((err, req, res, next) => {

    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === "production" ? "Internal Server Error" : err.message,
        error: err.message
    })
})

app.listen(PORT, () => {
    console.log("listening on port " + PORT)
    connectDB();
})