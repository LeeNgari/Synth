const axios = require('axios');
const querystring = require('querystring');
const fs = require('fs');

const CLIENT_ID = 'b9c836c30df24d38a24ea6c9029bda28';
const CLIENT_SECRET = '49ad60e073774b5f970e15f0b3748d60';
const REDIRECT_URI = 'http://localhost:3000/callback';

// Retry logic for rate limits
async function fetchWithRetry(url, config, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await axios.get(url, config);
    } catch (error) {
      if (error.response?.status === 429 && i < retries - 1) {
        console.log(`Rate limit hit, retrying after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
        continue;
      }
      throw error;
    }
  }
}

async function getAccessToken() {
  try {
    const authString = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      querystring.stringify({
        grant_type: 'client_credentials'
      }),
      {
        headers: {
          Authorization: `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error.response ? error.response.data : error.message);
    throw error;
  }
}

async function getPopularPlaylists(accessToken) {
  try {
    const response = await fetchWithRetry(
      'https://api.spotify.com/v1/search',
      {
        params: {
          q: 'top hits 2025', // More specific query
          type: 'playlist',
          limit: 10,
          market: 'US', // Try US market
        },
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    // Check if playlists exist and filter out invalid entries
    const playlists = response.data.playlists?.items || [];
    const validPlaylists = playlists
      .filter(playlist => playlist?.id)
      .map(playlist => playlist.id);

    if (validPlaylists.length === 0) {
      console.warn('No valid playlists found, using fallback IDs');
      return [
        '37i9dQZF1DXcBWIGoYBM5M', // Today's Top Hits
        '37i9dQZF1DX0kbJZpiYdZl', // Hot Hits USA
        '37i9dQZF1DWUa8ZRTfalHk', // Pop Rising
        '37i9dQZF1DXbYM3nMM0oPk', // Mega Hit Mix
        '37i9dQZF1DX1gRalH1mWrP', // Pop Up
      ];
    }

    console.log(`Found ${validPlaylists.length} playlists:`, validPlaylists);
    return validPlaylists;
  } catch (error) {
    console.error('Error fetching playlists:', error.response?.data?.error?.message || error.message);
    return [
      '37i9dQZF1DXcBWIGoYBM5M',
      '37i9dQZF1DX0kbJZpiYdZl',
      '37i9dQZF1DWUa8ZRTfalHk',
      '37i9dQZF1DXbYM3nMM0oPk',
      '37i9dQZF1DX1gRalH1mWrP',
    ];
  }
}

async function getTopSongs(accessToken, limit = 200) {
  try {
    const songs = new Map();
    const batchSize = 100;
    const playlistIds = await getPopularPlaylists(accessToken);

    for (const playlistId of playlistIds) {
      let offset = 0;
      let hasMore = true;

      while (hasMore && songs.size < limit) {
        try {
          const response = await fetchWithRetry(
            `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
            {
              params: {
                limit: batchSize,
                offset: offset,
              },
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            }
          );

          console.log(`Playlist ${playlistId}: Fetched ${response.data.items.length} tracks, offset ${offset}`);

          response.data.items.forEach(item => {
            const track = item.track;
            if (!track || songs.has(track.id)) return;

            const hasNonEnglishChars = /[^\x00-\xFF]/.test(track.name);
            if (hasNonEnglishChars) {
              console.log(`Filtered out: ${track.name} by ${track.artists.map(a => a.name).join(', ')}`);
              return;
            }

            const albumArtUrl = track.album.images.find(img => img.width === 300)?.url ||
              track.album.images[0]?.url ||
              'No album art available';

            songs.set(track.id, {
              id: track.id,
              title: track.name,
              artist: track.artists.map(artist => artist.name).join(', '),
              album: track.album.name,
              release_date: track.album.release_date,
              duration_ms: track.duration_ms,
              duration: `${Math.floor(track.duration_ms / 60000)}:${((track.duration_ms % 60000) / 1000).toFixed(0).padStart(2, '0')}`,
              album_art: albumArtUrl,
              spotify_url: track.external_urls.spotify,
              preview_url: track.preview_url || null,
              popularity: track.popularity
            });
          });

          console.log(`Fetched batch from playlist ${playlistId} (${songs.size} songs so far)`);

          offset += batchSize;
          hasMore = response.data.next && response.data.items.length > 0 && songs.size < limit;

          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          console.error(`Error fetching playlist ${playlistId} batch:`, error.response?.data?.error?.message || error.message);
          break;
        }
      }
    }

    // Search fallback with multiple genres and pagination
    if (songs.size < limit) {
      console.log('Using search fallback to get more popular songs...');
      const remaining = limit - songs.size;
      let searchOffset = 0;
      const genres = ['pop', 'rock', 'hip-hop', 'dance'];

      for (const genre of genres) {
        while (songs.size < limit && searchOffset < 200) {
          const searchResponse = await fetchWithRetry(
            'https://api.spotify.com/v1/search',
            {
              params: {
                q: `genre:${genre} year:2020-2025`,
                type: 'track',
                limit: Math.min(50, remaining),
                offset: searchOffset,
              },
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            }
          );

          searchResponse.data.tracks.items.forEach(track => {
            if (!track || songs.has(track.id)) return;

            const hasNonEnglishChars = /[^\x00-\xFF]/.test(track.name);
            if (hasNonEnglishChars) {
              console.log(`Filtered out (search): ${track.name} by ${track.artists.map(a => a.name).join(', ')}`);
              return;
            }

            const albumArtUrl = track.album.images.find(img => img.width === 300)?.url ||
              track.album.images[0]?.url ||
              'No album art available';

            songs.set(track.id, {
              id: track.id,
              title: track.name,
              artist: track.artists.map(artist => artist.name).join(', '),
              album: track.album.name,
              release_date: track.album.release_date,
              duration_ms: track.duration_ms,
              duration: `${Math.floor(track.duration_ms / 60000)}:${((track.duration_ms % 60000) / 1000).toFixed(0).padStart(2, '0')}`,
              album_art: albumArtUrl,
              spotify_url: track.external_urls.spotify,
              preview_url: track.preview_url || null,
              popularity: track.popularity
            });
          });

          console.log(`Search fallback (genre: ${genre}, offset: ${searchOffset}): Added ${searchResponse.data.tracks.items.length} tracks, total ${songs.size}`);
          searchOffset += 50;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        searchOffset = 0; // Reset offset for next genre
      }
    }

    return Array.from(songs.values())
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting top songs:', error.response?.data?.error?.message || error.message);
    throw error;
  }
}

async function main() {
  try {
    const accessToken = await getAccessToken();
    console.log('Successfully obtained access token');

    console.log('Fetching top popular songs...');
    const songs = await getTopSongs(accessToken, 200);

    const fileName = 'Song.json';
    fs.writeFileSync(fileName, JSON.stringify(songs, null, 2));
    console.log(`\nSuccessfully saved ${songs.length} songs to ${fileName}`);

    const uniqueArtists = new Set(songs.map(song => song.artist));
    console.log('\nCollection stats:');
    console.log(`- Unique artists: ${uniqueArtists.size}`);
    console.log(`- Average popularity: ${(songs.reduce((sum, song) => sum + song.popularity, 0) / songs.length || 0).toFixed(1)}/100`);

  } catch (error) {
    console.error('An error occurred:', error);
  }
}

main();