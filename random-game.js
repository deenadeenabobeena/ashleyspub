// Wait for the page to fully load
document.addEventListener('DOMContentLoaded', function() {
  // Create and add the random game button if it doesn't exist
  if (!document.getElementById('random-game-button')) {
    const randomButton = document.createElement('button');
    randomButton.id = 'random-game-button';
    randomButton.className = 'random-game-btn';
    randomButton.textContent = 'Random Game';
    
    // Insert after the stats div
    const statsDiv = document.getElementById('stats');
    if (statsDiv && statsDiv.parentNode) {
      statsDiv.parentNode.insertBefore(randomButton, statsDiv.nextSibling);
    }
  }
  
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
    // Create a new Algolia client using the config
    const searchClient = algoliasearch(
      config.algolia.app_id,
      config.algolia.api_key_search_only
    );
    
    // Determine which index to use
    let indexName = config.algolia.index_name;
    
    // Get a reference to the Algolia index
    const index = searchClient.initIndex(indexName);
    
    // Get a random game
    index.search('', {
      hitsPerPage: 1,
      randomToken: Math.floor(Math.random() * 1000000)
    }).then(function(response) {
      if (response.hits && response.hits.length > 0) {
        const randomGame = response.hits[0];
        showRandomGame(randomGame);
      } else {
        console.error('No games found in the index');
      }
    }).catch(function(err) {
      console.error('Error fetching random game:', err);
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
function showRandomGame(game) {
  // Process the game data similar to what's done in app.js
  const players = [];
  if (game.players) {
    game.players.forEach(function(num_players) {
      try {
        const match = num_players.level2.match(/^\d+\ >\ ([\w\ ]+)\ (?:with|allows)\ (\d+\+?)$/);
        if (match) {
          const type = match[1].toLowerCase();
          const num = match[2];

          const type_callback = {
            'best': function(num) { return '<strong>' + num + '</strong><span title="Best with">★</span>'; },
            'recommended': function(num) { return num; },
            'expansion': function(num) { return num + '<span title="With expansion">⊕</span>'; }
          };
          players.push(type_callback[type](num));

          if (num.indexOf("+") > -1) {
            return;
          }
        }
      } catch (e) {
        console.error('Error processing player data:', e);
      }
    });
  }
  
  game.players_str = players.join(", ");
  game.categories_str = game.categories ? game.categories.join(", ") : "";
  game.mechanics_str = game.mechanics ? game.mechanics.join(", ") : "";
  game.description = game.description ? game.description.trim() : "";
  game.has_expansions = game.expansions && game.expansions.length > 0;
  
  // Create a modal to display the game
  const modalHTML = `
    <div id="random-game-modal" class="game-details">
      <div class="game-details-wrapper">
        <h2 class="heading">
          <a href="https://boardgamegeek.com/boardgame/${game.id}">
            ${game.name}
          </a>
        </h2>
        <dl class="properties-header">
          <div>
            <img src="images/ico-players.svg" title="Supported players">
            <dd>${game.players_str}</dd>
          </div>
          <div>
            <img src="images/ico-rating.svg" title="Rating">
            <dd>${game.rating}</dd>
          </div>
          <div>
            <img src="images/ico-time.svg" title="Playing time">
            <dd>${game.playing_time}</dd>
          </div>
          <div>
            <img src="images/ico-complexity.svg" title="Complexity">
            <dd>${game.weight} <em>(${game.weight_rating})</em></dd>
          </div>
        </dl>
        <p class="description">
          ${game.description}
        </p>
        <dl class="properties-footer">
          <div>
            <span>Categories:</span>
            <dd>
              ${game.categories_str || '<em>No categories</em>'}
            </dd>
          </div>
          <div>
            <span>Mechanics:</span>
            <dd>
              ${game.mechanics_str || '<em>No mechanics</em>'}
            </dd>
          </div>
          ${game.has_expansions ? `
          <div class="expansions">
            <span>Expansions owned:</span>
            <dd><ul>
              ${game.expansions.map(exp => `
                <li><a href="https://boardgamegeek.com/boardgame/${exp.id}">${exp.name}</a></li>
              `).join('')}
            </ul></dd>
          </div>
          ` : ''}
        </dl>
        <div class="close">×</div>
      </div>
    </div>
  `;
  
  // Add modal to the page
  const modalContainer = document.createElement('div');
  modalContainer.innerHTML = modalHTML;
  document.body.appendChild(modalContainer.firstChild);
  
  // Set up the close button functionality
  const closeButton = document.querySelector('#random-game-modal .close');
  if (closeButton) {
    closeButton.addEventListener('click', function() {
      const modal = document.getElementById('random-game-modal');
      if (modal) {
        modal.remove();
      }
    });
  }
  
  // Close when clicking outside the modal content
  const modal = document.getElementById('random-game-modal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        this.remove();
      }
    });
  }
}
