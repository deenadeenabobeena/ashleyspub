/**
 * Cloudflare Worker to log board game plays to KV storage
 * Plays are stored locally and can be synced to BGG later
 */

export default {
  async fetch(request, env) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    const url = new URL(request.url);

    // POST: Log a play
    if (request.method === 'POST' && url.pathname === '/') {
      return handleLogPlay(request, env);
    }

    // GET: Retrieve recent plays (for future display on website)
    if (request.method === 'GET' && url.pathname === '/plays') {
      return handleGetPlays(env);
    }

    return new Response('Not found', { status: 404 });
  },
};

/**
 * Log a play to KV storage
 */
async function handleLogPlay(request, env) {
  try {
    const { gameId, gameName } = await request.json();
    
    if (!gameId) {
      return new Response('Missing gameId', { 
        status: 400,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }

    // Create play record
    const timestamp = new Date().toISOString();
    const playId = `play_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const playRecord = {
      playId,
      gameId,
      gameName: gameName || `Game ${gameId}`,
      timestamp,
      date: timestamp.split('T')[0], // YYYY-MM-DD format
    };

    // Store in KV
    await env.PLAY_LOGS.put(playId, JSON.stringify(playRecord));

    // Also maintain a list of recent plays (last 100)
    let recentPlays = [];
    try {
      const recentPlaysData = await env.PLAY_LOGS.get('recent_plays_list');
      if (recentPlaysData) {
        recentPlays = JSON.parse(recentPlaysData);
      }
    } catch (e) {
      console.error('Error reading recent plays:', e);
    }

    // Add new play to the beginning
    recentPlays.unshift(playRecord);
    
    // Keep only last 100 plays
    if (recentPlays.length > 100) {
      recentPlays = recentPlays.slice(0, 100);
    }

    // Store updated list
    await env.PLAY_LOGS.put('recent_plays_list', JSON.stringify(recentPlays));

    // Success!
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Play logged successfully!',
      playId,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Error logging play:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to log play'
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

/**
 * Get recent plays from KV storage
 */
async function handleGetPlays(env) {
  try {
    const recentPlaysData = await env.PLAY_LOGS.get('recent_plays_list');
    
    if (!recentPlaysData) {
      return new Response(JSON.stringify({
        plays: [],
        count: 0
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const plays = JSON.parse(recentPlaysData);
    
    return new Response(JSON.stringify({
      plays,
      count: plays.length
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Error retrieving plays:', error);
    return new Response('Error retrieving plays', { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
