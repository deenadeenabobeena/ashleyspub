// Welcome Popup Functionality
document.addEventListener('DOMContentLoaded', function() {
  // Check if this is user's first visit
  const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
  
  if (!hasVisitedBefore) {
    // Define the welcome popup HTML directly
    const welcomePopupHTML = `
      <div id="welcome-popup" class="welcome-popup">
        <div class="welcome-content">
          <div class="close">×</div>
          
          <!-- Single-screen welcome with simplified options -->
          <div id="welcome-screen" class="welcome-step">
            <h2>Welcome to Boardom's End!</h2>
            <p>Let's find the perfect game for your group. Set your preferences below.</p>
            
            <div class="welcome-form">
              <!-- Player count selection -->
              <div class="welcome-form-group">
                <label for="player-count">Number of Players:</label>
                <select id="player-count">
                  <option value="">Any number of players</option>
                  <option value="1">1 player</option>
                  <option value="2">2 players</option>
                  <option value="3">3 players</option>
                  <option value="4">4 players</option>
                  <option value="5">5 players</option>
                  <option value="6">6 players</option>
                  <option value="7">7 players</option>
                  <option value="8">8+ players</option>
                </select>
              </div>
              
              <!-- Complexity selection -->
              <div class="welcome-form-group">
                <label for="complexity-slider">Game Complexity:</label>
                <div class="complexity-slider-container">
                  <input type="range" min="1" max="5" value="3" class="complexity-slider" id="complexity-slider">
                  <div class="complexity-labels">
                    <span>Light</span>
                    <span>Medium</span>
                    <span>Heavy</span>
                  </div>
                </div>
                <div class="complexity-value" id="complexity-value">Medium</div>
              </div>
              
              <!-- Sort by options -->
              <div class="welcome-form-group">
                <label for="sort-by">Sort Games By:</label>
                <select id="sort-by-welcome">
                  <option value="name">Name</option>
                  <option value="rank">BGG Rank</option>
                  <option value="rating">Number of Ratings</option>
                  <option value="owned">Number of Owners</option>
                </select>
              </div>
            </div>
            
            <div class="welcome-buttons">
              <button id="apply-preferences" class="welcome-button">Find Games</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add CSS for the new complexity slider
    const sliderCSS = `
      <style>
        .complexity-slider-container {
          width: 100%;
          margin: 10px 0;
        }
        
        .complexity-slider {
          width: 100%;
          height: 8px;
          -webkit-appearance: none;
          appearance: none;
          background: #f1f1f1;
          outline: none;
          border-radius: 4px;
        }
        
        .complexity-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--main);
          cursor: pointer;
        }
        
        .complexity-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--main);
          cursor: pointer;
          border: none;
        }
        
        .complexity-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 5px;
          font-size: 12px;
          color: var(--dark);
        }
        
        .complexity-value {
          text-align: center;
          margin-top: 5px;
          font-weight: bold;
          color: var(--main);
        }
        
        .welcome-form-group {
          margin-bottom: 20px;
        }
      </style>
    `;
    
    // Add the CSS to the page
    document.head.insertAdjacentHTML('beforeend', sliderCSS);
    
    // Add the HTML to the page
    document.body.insertAdjacentHTML('beforeend', welcomePopupHTML);
    
    // Initialize the welcome popup functionality
    initWelcomePopup();
    
    // Set visited flag
    localStorage.setItem('hasVisitedBefore', 'true');
  }
});

function initWelcomePopup() {
  const welcomePopup = document.getElementById('welcome-popup');
  
  if (!welcomePopup) return;
  
  // Elements
  const closeButton = welcomePopup.querySelector('.close');
  const applyPreferencesButton = document.getElementById('apply-preferences');
  
  // User selections
  const playerCount = document.getElementById('player-count');
  const complexitySlider = document.getElementById('complexity-slider');
  const complexityValue = document.getElementById('complexity-value');
  const sortByWelcome = document.getElementById('sort-by-welcome');
  
  // Initialize complexity slider value display
  updateComplexityValue(complexitySlider.value);
  
  // Update complexity text when slider moves
  complexitySlider.addEventListener('input', function() {
    updateComplexityValue(this.value);
  });
  
  function updateComplexityValue(value) {
    const complexityLabels = {
      '1': 'Light',
      '2': 'Light Medium',
      '3': 'Medium',
      '4': 'Medium Heavy',
      '5': 'Heavy'
    };
    complexityValue.textContent = complexityLabels[value];
  }
  
  // Close functionality
  function closeWelcomePopup() {
    welcomePopup.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
  
  // Function to capture all available filter options from the actual UI
  function captureAvailableFilters() {
    // Create a data structure to store all available filter options
    const availableFilters = {
      players: [],
      complexity: []
    };
    
    // Get actual player count options from the DOM
    const playerFilters = document.querySelectorAll('#facet-players .ais-HierarchicalMenu-item');
    console.log(`Found ${playerFilters.length} player filter options`);
    
    playerFilters.forEach((filter, index) => {
      const label = filter.querySelector('.ais-HierarchicalMenu-label');
      if (label) {
        const text = label.textContent.trim();
        console.log(`Player option ${index}: "${text}"`);
        
        // Store both the text and the DOM element for direct access later
        availableFilters.players.push({
          text: text,
          element: label
        });
      }
    });
    
    // Get actual complexity options from the DOM
    const complexityFilters = document.querySelectorAll('#facet-weight .ais-RefinementList-item');
    console.log(`Found ${complexityFilters.length} complexity filter options`);
    
    complexityFilters.forEach((filter, index) => {
      const label = filter.querySelector('.ais-RefinementList-label');
      if (label) {
        const text = label.textContent.trim();
        console.log(`Complexity option ${index}: "${text}"`);
        
        // Store both the text and the DOM element for direct access later
        availableFilters.complexity.push({
          text: text,
          element: label
        });
      }
    });
    
    console.log("All available filters captured:", availableFilters);
    return availableFilters;
  }
  
  // Function to find the best matching filter for a given value
  function findBestMatch(options, value) {
    // First try for exact match
    const exactMatch = options.find(option => option.text === value);
    if (exactMatch) {
      console.log(`Found exact match: "${exactMatch.text}"`);
      return exactMatch;
    }
    
    // Try for starts with match
    const startsWithMatch = options.find(option => option.text.startsWith(value));
    if (startsWithMatch) {
      console.log(`Found starts-with match: "${startsWithMatch.text}" for "${value}"`);
      return startsWithMatch;
    }
    
    // Try for contains match
    const containsMatch = options.find(option => option.text.includes(value));
    if (containsMatch) {
      console.log(`Found contains match: "${containsMatch.text}" for "${value}"`);
      return containsMatch;
    }
    
    // Try for case-insensitive match
    const caseInsensitiveMatch = options.find(option => 
      option.text.toLowerCase() === value.toLowerCase()
    );
    if (caseInsensitiveMatch) {
      console.log(`Found case-insensitive match: "${caseInsensitiveMatch.text}" for "${value}"`);
      return caseInsensitiveMatch;
    }
    
    console.log(`No match found for "${value}"`);
    return null;
  }
  
  // Apply selected sort option
  function applySortOption(sortValue) {
    const sortByElement = document.querySelector('#sort-by .ais-SortBy-select');
    if (sortByElement) {
      // Map welcome popup sort values to actual sort values
      const sortMapping = {
        'name': 0,      // Assuming "Name" is the first option
        'rank': 1,      // Assuming "BGG Rank" is the second option
        'rating': 2,    // Assuming "Number of ratings" is the third option
        'owned': 3      // Assuming "Number of owners" is the fourth option
      };
      
      const optionIndex = sortMapping[sortValue];
      if (optionIndex !== undefined) {
        sortByElement.selectedIndex = optionIndex;
        
        // Trigger change event to apply the sort
        const event = new Event('change', { bubbles: true });
        sortByElement.dispatchEvent(event);
        
        console.log(`Applied sort by: ${sortValue}`);
      }
    }
  }
  
  // Function to apply preferences using the captured filters
  function applyPreferencesWithMapping() {
    // Get user selections
    const playerValue = playerCount.value;
    const complexityValue = complexityValue.textContent;
    const sortValue = sortByWelcome.value;
    
    console.log("User selections:", {
      player: playerValue,
      complexity: complexityValue,
      sort: sortValue
    });
    
    // Capture all available filter options from the actual UI
    setTimeout(() => {
      const availableFilters = captureAvailableFilters();
      
      // Apply player count filter if selected
      if (playerValue) {
        console.log(`Trying to apply player filter: ${playerValue}`);
        
        // Find best match from available options
        const playerMatch = findBestMatch(availableFilters.players, playerValue);
        
        if (playerMatch) {
          console.log(`Clicking player option: "${playerMatch.text}"`);
          playerMatch.element.click();
        } else {
          console.log(`No match found for player count: ${playerValue}`);
        }
      }
      
      // Apply complexity filter if selected
      if (complexityValue) {
        console.log(`Trying to apply complexity filter: ${complexityValue}`);
        
        // Find best match from available options
        const complexityMatch = findBestMatch(availableFilters.complexity, complexityValue);
        
        if (complexityMatch) {
          console.log(`Clicking complexity option: "${complexityMatch.text}"`);
          complexityMatch.element.click();
        } else {
          console.log(`No match found for complexity: ${complexityValue}`);
        }
      }
      
      // Apply sort option
      if (sortValue) {
        console.log(`Applying sort option: ${sortValue}`);
        applySortOption(sortValue);
      }
    }, 1000); // Allow time for facets to load
  }
  
  // Apply filters function
  function applyPreferences() {
    // Close the popup first
    closeWelcomePopup();
    
    // Short delay to ensure facets are loaded
    setTimeout(() => {
      console.log("Applying preferences...");
      applyPreferencesWithMapping();
    }, 800);
  }
  
  // Event listeners
  if (closeButton) {
    closeButton.addEventListener('click', closeWelcomePopup);
  }
  
  if (applyPreferencesButton) {
    applyPreferencesButton.addEventListener('click', applyPreferences);
  }
  
  // Close on ESC key
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && welcomePopup.style.display !== 'none') {
      closeWelcomePopup();
    }
  });
  
  // Close when clicking outside content
  welcomePopup.addEventListener('click', function(event) {
    if (event.target === welcomePopup) {
      closeWelcomePopup();
    }
  });
}

// Function to clear all active filters
function clearAllFilters() {
  // Find and click the "Clear all" button if it exists and is visible
  const clearAllButton = document.querySelector('#clear-all .ais-ClearRefinements-button:not(.ais-ClearRefinements-button--disabled)');
  if (clearAllButton) {
    clearAllButton.click();
    console.log('Cleared all filters');
  } else {
    console.log('No active filters to clear');
  }
  
  // Clear the search box input
  const searchInput = document.querySelector('.ais-SearchBox-input');
  if (searchInput) {
    searchInput.value = '';
    
    // Create and dispatch an input event to trigger the search update
    const inputEvent = new Event('input', { bubbles: true });
    searchInput.dispatchEvent(inputEvent);
    
    console.log('Cleared search box');
  }
}

// Function to reset the welcome popup (for testing)
function resetWelcomePopup() {
  // Clear all filters and search box first
  clearAllFilters();
  
  // Remove the hasVisitedBefore flag to show the welcome popup again
  localStorage.removeItem('hasVisitedBefore');
  
  // Short delay to ensure filters are cleared before reloading
  setTimeout(() => {
    // Reload the page to show the welcome popup
    window.location.reload();
  }, 300);
}

// Add this code to create a reset button (useful for testing)
document.addEventListener('DOMContentLoaded', function() {
  // Create a small button in the corner to reset the welcome popup
  const resetButton = document.createElement('button');
  resetButton.innerHTML = 'Reset Welcome';
  resetButton.style.position = 'fixed';
  resetButton.style.bottom = '60px';
  resetButton.style.right = '10px';
  resetButton.style.zIndex = '999';
  resetButton.style.fontSize = '12px';
  resetButton.style.padding = '5px';
  resetButton.style.background = '#f1f1f1';
  resetButton.style.border = '1px solid #ccc';
  resetButton.style.borderRadius = '4px';
  resetButton.style.cursor = 'pointer';
  resetButton.style.opacity = '0.7';
  
  resetButton.addEventListener('click', resetWelcomePopup);
  
  document.body.appendChild(resetButton);
});
