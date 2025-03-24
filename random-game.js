// Wait for the page to fully load
document.addEventListener('DOMContentLoaded', function() {
  // Add event listener for the random game button
  const randomButton = document.getElementById('random-game-button');
  if (randomButton) {
    randomButton.addEventListener('click', getRandomGame);
  }
});

// Function to get a random game from Algolia
function getRandomGame() {
  // Load the config file to get Algolia settings
  loadJSONForRandomGame("config.json", function(config) {
    // Get the search client using the same configuration as your app
    const searchClient = algoliasearch(
      config.algolia.app_id,
      config.algolia.api_key_search_only
    );
    
    // Use the same index name that's already defined in your config
    const indexName = config.algolia.index_name;
    const index = searchClient.initIndex(indexName);
    
    // First, get the total number of pages
    index.search('', {
      hitsPerPage: 20  // Standard page size
    }).then(function(response) {
      const totalPages = response.nbPages;
      if (totalPages > 0) {
        // Get a random page number
        const randomPage = Math.floor(Math.random() * totalPages);
        
        // Now fetch records from that random page
        index.search('', {
          hitsPerPage: 20,
          page: randomPage
        }).then(function(response) {
          if (response.hits && response.hits.length > 0) {
            // Pick a random game from the page
            const randomIndex = Math.floor(Math.random() * response.hits.length);
            const randomGame = response.hits[randomIndex];
            displayRandomGame(randomGame, config);
          } else {
            console.error('No games found on random page');
          }
        }).catch(function(err) {
          console.error('Error fetching random page:', err);
        });
      } else {
        console.error('No games found in the index');
      }
    }).catch(function(err) {
      console.error('Error getting total pages:', err);
    });
  });
}

// Helper function to load the config JSON
function loadJSONForRandomGame(path, callback) {
  var req = new XMLHttpRequest();
  req.overrideMimeType("application/json");
  req.open('GET', path, true);
  req.onreadystatechange = function () {
    if (req.readyState == 4 && req.status == "200") {
      callback(JSON.parse(req.responseText));
    }
  };
  req.send(null);
}

// Function to display a random game
function displayRandomGame(game, config) {
  console.log("Displaying random game:", game.name); // Add this to check which game is shown
  
  // Create a details element like the ones used for regular games
  const detailsElement = document.createElement('details');
  detailsElement.className = 'game-wrapper';
  detailsElement.setAttribute('open', ''); // Open by default
  
  // Create a simple HTML structure for the game
  detailsElement.innerHTML = `
    <summary>
      <div class="game">
        <img src="${game.image}" alt="${game.name}">
      </div>
      <div class="gamename">${game.name}</div>
    </summary>
    <div class="game-details">
      <div class="game-details-wrapper">
        <h2 class="heading">
          <a href="https://boardgamegeek.com/boardgame/${game.id}">
            ${game.name}
          </a>
        </h2>
        <dl class="properties-header">
          <div>
            <img src="images/ico-players.svg" title="Supported players">
            <dd>${game.players_str || 'Unknown'}</dd>
          </div>
          <div>
            <img src="images/ico-rating.svg" title="Rating">
            <dd>${game.rating || 'No rating'}</dd>
          </div>
          <div>
            <img src="images/ico-time.svg" title="Playing time">
            <dd>${game.playing_time || 'Unknown'}</dd>
          </div>
          <div>
            <img src="images/ico-complexity.svg" title="Complexity">
            <dd>${game.weight || 'Unknown'} ${game.weight_rating ? `<em>(${game.weight_rating})</em>` : ''}</dd>
          </div>
        </dl>
        <p class="description">
          ${game.description || 'No description available'}
        </p>
        <dl class="properties-footer">
          <div>
            <span>Categories:</span>
            <dd>
              ${game.categories ? game.categories.join(", ") : '<em>No categories</em>'}
            </dd>
          </div>
          <div>
            <span>Mechanics:</span>
            <dd>
              ${game.mechanics ? game.mechanics.join(", ") : '<em>No mechanics</em>'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  `;
  
  // Add the details element to the body
  document.body.appendChild(detailsElement);
  
  // Add the close button
  const gameDetails = detailsElement.querySelector('.game-details');
  const closeButton = document.createElement('div');
  closeButton.className = 'close';
  closeButton.innerHTML = '×';
  closeButton.addEventListener('click', function() {
    detailsElement.remove();
  });
  gameDetails.querySelector('.game-details-wrapper').appendChild(closeButton);
  
  // Stop propagation of click events inside the game details
  gameDetails.addEventListener('click', function(event) {
    event.stopPropagation();
  });
  
  // Add event listener to close when clicking outside
  document.addEventListener('click', function closeRandomGame(event) {
    if (event.target !== detailsElement && !detailsElement.contains(event.target)) {
      detailsElement.remove();
      document.removeEventListener('click', closeRandomGame);
    }
  });
}
