import YTMusicAPI from "ytmusic-api";
import fs from 'fs';

const ytmusic = new YTMusicAPI();

// Converts duration string "4:32" or "1:05:00" to total seconds
function durationToSeconds(durationStr) {
    if (typeof durationStr !== 'string') return 0;

    const parts = durationStr.split(':').map(Number).reverse();
    let seconds = 0;
    if (parts.length >= 1) seconds += parts[0];
    if (parts.length >= 2) seconds += parts[1] * 60;
    if (parts.length >= 3) seconds += parts[2] * 3600;
    return seconds;
}


// Function to find the best match: audio-only, by original artist, ≤ 6 minutes
function findBestMatch(results, originalArtist) {
    const SIX_MINUTES = 6 * 60;

    // Helper to validate a result
    const isValid = (item) => {
        console.log(`Found: ${item.name} (${item.duration})`);

        if (!item.duration || !item.videoId) return false;
        console.log(`Found: ${item.name} (${item.duration})`);

        const durationSecs = durationToSeconds(item.duration);
        return (
            item.type === 'VIDEO' &&
            item.artist?.name.toLowerCase().includes(originalArtist.toLowerCase()) &&
            durationSecs <= SIX_MINUTES
        );
    };

    // Priority: Official Audio
    const officialAudio = results.find(item =>
        isValid(item) &&
        item.name.toLowerCase().includes('official audio')
    );
    if (officialAudio) return officialAudio;

    // Then: Any artist video under 6 minutes
    const artistVideo = results.find(isValid);
    if (artistVideo) return artistVideo;

    // No valid match
    return null;
}

async function processSongs(inputFile, outputFile) {
    try {
        await ytmusic.initialize();

        const songData = JSON.parse(fs.readFileSync(inputFile));
        const results = [];

        for (const song of songData) {
            try {
                console.log(`Searching for: ${song.artist} - ${song.title}`);

                const searchResults = await ytmusic.search(`${song.artist} ${song.title}`);
                const bestMatch = findBestMatch(searchResults, song.artist);

                if (!bestMatch) {
                    console.log(`No valid match found for: ${song.artist} - ${song.title}`);
                    continue;
                }

                results.push({
                    ...song,
                    youtube_url: `https://www.youtube.com/watch?v=${bestMatch.videoId}`
                });

                console.log(`✅ Matched: ${bestMatch.name} (${bestMatch.duration})`);

            } catch (error) {
                console.error(`❌ Error processing ${song.artist} - ${song.title}:`, error);
                continue;
            }

            // Delay to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
        console.log(`✅ All valid results saved to ${outputFile}`);

    } catch (error) {
        console.error("❌ General Error:", error);
    }
}

// Replace these paths with your own
const inputJsonFile = 'Song.json';
const outputJsonFile = 'youtube_matches.json';

processSongs(inputJsonFile, outputJsonFile);
