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
                <label for="complexity">Game Complexity:</label>
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
  
  // Function to simulate clicking on a facet label
  function clickFacetLabel(selector, targetText) {
    // Wait a short time to ensure facets are loaded
    setTimeout(() => {
      const elements = document.querySelectorAll(selector);
      
      // For debugging
      console.log(`Looking for filter with text containing "${targetText}" among ${elements.length} elements`);
      
      let found = false;
      elements.forEach(element => {
        const text = element.textContent.trim();
        console.log(`Checking element with text: "${text}"`);
        
        if (text.includes(targetText)) {
          console.log(`Found matching element: "${text}"`);
          element.click();
          found = true;
        }
      });
      
      if (!found) {
        console.log(`No element found with text containing "${targetText}"`);
      }
    }, 500); // Wait 500ms to ensure UI is loaded
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
    
    // Short delay to ensure facets are loaded
    setTimeout(() => {
      console.log("Applying preferences...");
      
      // Apply player count filter if selected
      if (playerCount.value) {
        console.log(`Applying player filter: ${playerCount.value}`);
        // Find and click the player count filter
        clickFacetLabel('#facet-players .ais-HierarchicalMenu-label', playerCount.value);
      }
      
      // Apply complexity filter based on slider value
      const complexityValue = document.getElementById('complexity-slider').value;
      const complexityLabels = {
        '1': 'Light',
        '2': 'Light Medium',
        '3': 'Medium',
        '4': 'Medium Heavy',
        '5': 'Heavy'
      };
      const complexityText = complexityLabels[complexityValue];
      
      console.log(`Applying complexity filter: ${complexityText}`);
      clickFacetLabel('#facet-weight .ais-RefinementList-label', complexityText);
      
      // Apply sort option
      if (sortByWelcome.value) {
        console.log(`Applying sort option: ${sortByWelcome.value}`);
        applySortOption(sortByWelcome.value);
      }
    }, 500);
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
