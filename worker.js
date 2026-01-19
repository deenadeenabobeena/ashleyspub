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
          'Access-Control-Allow-Methods': 'POST, GET, PATCH, OPTIONS',
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
    // PATCH: Update report status
    if (request.method === 'PATCH' && url.pathname === '/report') {
      return handleUpdateReportStatus(request, env);
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
    // GET: Retrieve top searches
if (request.method === 'GET' && url.pathname === '/top-searches') {
  return handleGetTopSearches(env);
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
  try {
    const { gameId, gameName } = await request.json();

    // Create play record
    const playId = `play_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const playRecord = {
      playId,
      gameId,
      gameName,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
    };

    // Store the play
    await env.PLAY_LOGS.put(playId, JSON.stringify(playRecord));

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Play logged successfully',
      playId: playId,
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
    // List all keys that start with "play_"
    const list = await env.PLAY_LOGS.list({ prefix: 'play_' });
    
    // Fetch all play records
    const plays = await Promise.all(
      list.keys.map(async (key) => {
        const data = await env.PLAY_LOGS.get(key.name);
        return data ? JSON.parse(data) : null;
      })
    );

    // Filter out any null values and sort by timestamp (newest first)
    const validPlays = plays
      .filter(play => play !== null)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return new Response(JSON.stringify({
      success: true,
      plays: validPlays,
      count: validPlays.length,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Error retrieving plays:', error);
    return new Response(JSON.stringify({
      success: false,
      plays: [],
      count: 0,
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
 * Report an issue with a game
 */
async function handleReportIssue(request, env) {
  try {
    const { 
      gameId, 
      gameName, 
      issueType,
      issueDetails 
    } = await request.json();

    // Create report record
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const reportRecord = {
      reportId,
      gameId,
      gameName,
      issueType,
      issueDetails: issueDetails || '',
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
    };

    // Store the report
    await env.PLAY_LOGS.put(reportId, JSON.stringify(reportRecord));

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Report submitted successfully',
      reportId: reportId,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Error reporting issue:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to submit report'
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
 * Get recent reports from KV storage
 */
async function handleGetReports(env) {
  try {
    // List all keys that start with "report_"
    const list = await env.PLAY_LOGS.list({ prefix: 'report_' });
    
    // Fetch all report records
    const reports = await Promise.all(
      list.keys.map(async (key) => {
        const data = await env.PLAY_LOGS.get(key.name);
        return data ? JSON.parse(data) : null;
      })
    );

    // Filter out any null values and sort by timestamp (newest first)
    const validReports = reports
      .filter(report => report !== null)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return new Response(JSON.stringify({
      success: true,
      reports: validReports,
      count: validReports.length,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Error retrieving reports:', error);
    return new Response(JSON.stringify({
      success: false,
      reports: [],
      count: 0,
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
 * Update a report's status
 */
async function handleUpdateReportStatus(request, env) {
  try {
    const { reportId, status } = await request.json();
    
    // Valid statuses
    const validStatuses = ['pending', 'reviewed', 'fixed'];
    if (!validStatuses.includes(status)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid status'
      }), { 
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // Get the existing report
    const reportData = await env.PLAY_LOGS.get(reportId);
    if (!reportData) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Report not found'
      }), { 
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // Update the status
    const report = JSON.parse(reportData);
    report.status = status;
    report.updatedAt = new Date().toISOString();
    
    // Save back to KV
    await env.PLAY_LOGS.put(reportId, JSON.stringify(report));
    
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Report status updated',
      report: report,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
    
  } catch (error) {
    console.error('Error updating report status:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to update report status'
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
/**
 * Get top search terms
 */
async function handleGetTopSearches(env) {
  try {
    // Get the recent searches list
    const recentSearchesData = await env.PLAY_LOGS.get('recent_searches_list');
    
    if (!recentSearchesData) {
      return new Response(JSON.stringify({
        success: true,
        topSearches: [],
        count: 0,
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    const searches = JSON.parse(recentSearchesData);
    
    // Count search queries (ignore empty queries)
    const queryCounts = {};
    searches.forEach(search => {
      const query = search.query.trim().toLowerCase();
      if (query.length >= 3) { // Only count searches with 3+ characters
        queryCounts[query] = (queryCounts[query] || 0) + 1;
      }
    });
    
    // Convert to array and sort by count
    const topSearches = Object.entries(queryCounts)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10
    
    return new Response(JSON.stringify({
      success: true,
      topSearches: topSearches,
      count: topSearches.length,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Error retrieving top searches:', error);
    return new Response(JSON.stringify({
      success: false,
      topSearches: [],
      count: 0,
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
