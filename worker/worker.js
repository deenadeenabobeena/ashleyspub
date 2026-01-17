/**
 * Cloudflare Worker to log board game plays to BoardGameGeek
 * This handles requests from the website to log anonymous plays
 */

export default {
  async fetch(request, env) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Only accept POST requests
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      // Get game ID from request body
      const { gameId } = await request.json();
      
      if (!gameId) {
        return new Response('Missing gameId', { status: 400 });
      }

      // Get BGG token from environment variable
      const bggToken = env.BGG_TOKEN;
      
      if (!bggToken) {
        return new Response('Server configuration error', { status: 500 });
      }

      // Prepare play data
      const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      
      // BGG API endpoint for logging plays
      const bggUrl = 'https://boardgamegeek.com/xmlapi2/play';
      
      // Create form data for the play
      const formData = new URLSearchParams();
      formData.append('objecttype', 'thing');
      formData.append('objectid', gameId);
      formData.append('playdate', today);
      formData.append('quantity', '1');
      
      // Log the play to BGG
      const bggResponse = await fetch(bggUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${bggToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!bggResponse.ok) {
        console.error('BGG API error:', await bggResponse.text());
        return new Response('Failed to log play to BGG', { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // Success!
      return new Response(JSON.stringify({ 
        success: true,
        message: 'Play logged successfully!' 
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });

    } catch (error) {
      console.error('Error:', error);
      return new Response('Internal server error', { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};
