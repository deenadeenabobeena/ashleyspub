// Welcome Popup Functionality
document.addEventListener('DOMContentLoaded', function() {
  // CHANGE: Remove the condition check to display the popup every time
  // const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
  // if (!hasVisitedBefore) {
  
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
              <div class="complexity-display" id="complexity-display">Medium</div>
            </div>
            
            <!-- Sort by options -->
            <div class="welcome-form-group">
              <label for="sort-by-welcome">Sort Games By:</label>
              <select id="sort-by-welcome">
              <option value="rank">Best</option>
                <option value="name">Name</option>
                <option value="owned">Popularity</option>
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
      
      .complexity-display {
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
  
  // CHANGE: Remove this line to prevent setting the flag
  // localStorage.setItem('hasVisitedBefore', 'true');
  
  // CHANGE: Close the conditional that we removed
  // }
});

function initWelcomePopup() {
  const welcomePopup = document.getElementById('welcome-popup');
  
  if (!welcomePopup) return;
  
  // Elements
  const closeButton = welcomePopup.querySelector('.close');
  const applyPreferencesButton = document.getElementById('apply-preferences');
  
  // User selections
  const playerCountSelect = document.getElementById('player-count');
  const complexitySlider = document.getElementById('complexity-slider');
  const complexityDisplay = document.getElementById('complexity-display');
  const sortBySelect = document.getElementById('sort-by-welcome');
  
  // Complexity mapping
  const COMPLEXITY_LABELS = {
    '1': 'Light',
    '2': 'Light Medium',
    '3': 'Medium',
    '4': 'Medium Heavy',
    '5': 'Heavy'
  };
  
  // Initialize complexity slider value display
  updateComplexityDisplay(complexitySlider.value);
  
  // Update complexity text when slider moves
  complexitySlider.addEventListener('input', function() {
    updateComplexityDisplay(this.value);
  });
  
  function updateComplexityDisplay(value) {
    complexityDisplay.textContent = COMPLEXITY_LABELS[value];
  }
  
  // Close functionality
  function closeWelcomePopup() {
    welcomePopup.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
  
  // Function to directly click on a filter option in the facets
  function clickFilterOption(selector, optionText) {
    console.log(`Looking for filter option: "${optionText}" in ${selector}`);
    
    // Wait a bit for facets to load
    setTimeout(() => {
      // Get all labels within the specified selector
      const labels = document.querySelectorAll(`${selector} .ais-RefinementList-label, ${selector} .ais-HierarchicalMenu-label`);
      console.log(`Found ${labels.length} potential options`);
      
      // Try to find and click the matching label
      let found = false;
      
      // First try for exact match
      for (let i = 0; i < labels.length; i++) {
        const label = labels[i];
        const text = label.textContent.trim();
        console.log(`Option ${i}: "${text}"`);
        
        if (text === optionText) {
          console.log(`Found exact match: "${text}"`);
          label.click();
          found = true;
          break;
        }
      }
      
      // If no exact match, try for starts with match
      if (!found) {
        for (let i = 0; i < labels.length; i++) {
          const label = labels[i];
          const text = label.textContent.trim();
          
          if (text.startsWith(optionText) || optionText.startsWith(text)) {
            console.log(`Found partial match: "${text}" for "${optionText}"`);
            label.click();
            found = true;
            break;
          }
        }
      }
      
      if (!found) {
        console.log(`No match found for "${optionText}"`);
      }
    }, 1000);
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
  
  // Apply filters function
  function applyPreferences() {
    // Close the popup first
    closeWelcomePopup();
    
    // Get the selected values
    const playerValue = playerCountSelect.value;
    const sliderValue = complexitySlider.value;
    const complexityValue = COMPLEXITY_LABELS[sliderValue];
    const sortValue = sortBySelect.value;
    
    console.log("User selections:", {
      player: playerValue,
      complexity: complexityValue,
      sort: sortValue
    });
    
    // Apply the filters with a delay to ensure UI is loaded
    setTimeout(() => {
      // Apply player count filter if selected
      if (playerValue) {
        clickFilterOption('#facet-players', playerValue);
      }
      
      // Apply complexity filter if selected
      if (complexityValue) {
        clickFilterOption('#facet-weight', complexityValue);
      }
      
      // Apply sort option
      if (sortValue) {
        applySortOption(sortValue);
      }
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