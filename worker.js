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
    // POST: Report an issue
    if (request.method === 'POST' && url.pathname === '/report') {
      return handleReportIssue(request, env);
    }
    // POST: Log a search
    if (request.method === 'POST' && url.pathname === '/search') {
      return handleLogSearch(request, env);
    }
    // GET: Retrieve search stats
    if (request.method === 'GET' && url.pathname === '/search-stats') {
      return handleGetSearchStats(env);
    }
    // GET: Retrieve recent plays (for future display on website)
    if (request.method === 'GET' && url.pathname === '/plays') {
      return handleGetPlays(env);
    }
    // GET: Retrieve recent reports
    if (request.method === 'GET' && url.pathname === '/reports') {
      return handleGetReports(env);
    }
    return new Response('Not found', { status: 404 });
  },
};

/**
 * Log a play to KV storage
 */
async function handleLogPlay(request, env) {
  // ... your existing handleLogPlay code ...
}

/**
 * Get recent plays from KV storage
 */
async function handleGetPlays(env) {
  // ... your existing handleGetPlays code ...
}

/**
 * Report an issue with a game
 */
async function handleReportIssue(request, env) {
  // ... your existing handleReportIssue code ...
}

/**
 * Get recent reports from KV storage
 */
async function handleGetReports(env) {
  // ... your existing handleGetReports code ...
}

/**
 * Log a search to KV storage
 */
async function handleLogSearch(request, env) {
  try {
    const { 
      query, 
      refinements, 
      resultsCount, 
      timestamp 
    } = await request.json();

    // Create search record
    const searchId = `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const searchRecord = {
      searchId,
      query: query || '',
      refinements: refinements || {},
      resultsCount: resultsCount || 0,
      timestamp: timestamp || new Date().toISOString(),
      date: (timestamp || new Date().toISOString()).split('T')[0],
    };

    // Store individual search
    await env.PLAY_LOGS.put(searchId, JSON.stringify(searchRecord));

    // Update search counter for this month
    const monthKey = searchRecord.date.substring(0, 7); // YYYY-MM
    const counterKey = `search_count_${monthKey}`;
    
    let currentCount = 0;
    try {
      const countData = await env.PLAY_LOGS.get(counterKey);
      if (countData) {
        currentCount = parseInt(countData);
      }
    } catch (e) {
      console.error('Error reading search count:', e);
    }
    
    // Increment and store
    await env.PLAY_LOGS.put(counterKey, (currentCount + 1).toString());

    // Also maintain a list of recent searches (last 100)
    let recentSearches = [];
    try {
      const recentSearchesData = await env.PLAY_LOGS.get('recent_searches_list');
      if (recentSearchesData) {
        recentSearches = JSON.parse(recentSearchesData);
      }
    } catch (e) {
      console.error('Error reading recent searches:', e);
    }

    // Add new search to the beginning
    recentSearches.unshift(searchRecord);
    
    // Keep only last 100 searches
    if (recentSearches.length > 100) {
      recentSearches = recentSearches.slice(0, 100);
    }

    // Store updated list
    await env.PLAY_LOGS.put('recent_searches_list', JSON.stringify(recentSearches));

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Search logged successfully',
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Error logging search:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to log search'
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
 * Get search statistics
 */
async function handleGetSearchStats(env) {
  try {
    // Get current month's count
    const now = new Date();
    const monthKey = now.toISOString().substring(0, 7); // YYYY-MM
    const counterKey = `search_count_${monthKey}`;
    
    let monthCount = 0;
    try {
      const countData = await env.PLAY_LOGS.get(counterKey);
      if (countData) {
        monthCount = parseInt(countData);
      }
    } catch (e) {
      console.error('Error reading search count:', e);
    }

    return new Response(JSON.stringify({
      currentMonth: monthKey,
      searchCount: monthCount,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Error retrieving search stats:', error);
    return new Response(JSON.stringify({
      currentMonth: new Date().toISOString().substring(0, 7),
      searchCount: 0,
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
