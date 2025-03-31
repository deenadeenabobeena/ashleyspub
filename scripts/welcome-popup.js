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
  
  // Function to inspect player filters to better understand the format
  function inspectPlayerFilters() {
    console.log("Inspecting player filters...");
    const playerFilters = document.querySelectorAll('#facet-players .ais-HierarchicalMenu-item');
    
    playerFilters.forEach(filter => {
      const label = filter.querySelector('.ais-HierarchicalMenu-label');
      const text = label ? label.textContent.trim() : 'No label found';
      console.log(`Player filter: ${text}`);
    });
  }
  
  // Function to find and click specific player count filter by examining all available options
  function clickPlayerCountFilter(playerCount) {
    // Wait for facets to load
    setTimeout(() => {
      // First, inspect available player filters
      inspectPlayerFilters();
      
      // Try to find exact match for the player count
      const playerFilters = document.querySelectorAll('#facet-players .ais-HierarchicalMenu-item');
      
      let found = false;
      playerFilters.forEach(filter => {
        const label = filter.querySelector('.ais-HierarchicalMenu-label');
        if (!label) return;
        
        const text = label.textContent.trim();
        
        // Check if the player count matches the exact number
        if (text === playerCount || text === `${playerCount}`) {
          console.log(`Found exact match for player count ${playerCount}: "${text}"`);
          label.click();
          found = true;
          return;
        }
      });
      
      if (!found) {
        console.log(`No exact match found for player count ${playerCount}, looking for closest match...`);
        
        // If no exact match, try to find first level menu items
        playerFilters.forEach(filter => {
          const label = filter.querySelector('.ais-HierarchicalMenu-label');
          if (!label) return;
          
          const text = label.textContent.trim();
          
          // Try to match just the number without additional text
          if (text.startsWith(playerCount) || text === playerCount) {
            console.log(`Found closest match for player count ${playerCount}: "${text}"`);
            label.click();
            found = true;
            return;
          }
        });
      }
      
      if (!found) {
        console.log(`Could not find any match for player count ${playerCount}`);
      }
    }, 800); // Increase timeout to ensure UI is fully loaded
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
  
  // Function to inspect complexity filters
  function inspectComplexityFilters() {
    console.log("Inspecting complexity filters...");
    const complexityItems = document.querySelectorAll('#facet-weight .ais-RefinementList-item');
    
    if (complexityItems.length === 0) {
      console.log("No complexity filters found! The selector might be incorrect.");
    }
    
    complexityItems.forEach((item, index) => {
      const label = item.querySelector('.ais-RefinementList-label');
      const text = label ? label.textContent.trim() : 'No label found';
      console.log(`Complexity filter ${index}: "${text}"`);
      
      // Also log the HTML structure to see what's inside
      console.log("Element HTML:", item.outerHTML);
    });
    
    // Also check if the facet-weight element exists
    const facetWeight = document.getElementById('facet-weight');
    if (facetWeight) {
      console.log("facet-weight element found");
      console.log("facet-weight HTML:", facetWeight.outerHTML);
    } else {
      console.log("facet-weight element NOT found!");
    }
  }
  
  // Function to force-click complexity filter by simulating a mousedown and mouseup event
  function forceClickElement(element) {
    if (!element) {
      console.log("Cannot force-click null element");
      return false;
    }
    
    try {
      // Create and dispatch mousedown event
      const mouseDown = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      element.dispatchEvent(mouseDown);
      
      // Create and dispatch mouseup event
      const mouseUp = new MouseEvent('mouseup', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      element.dispatchEvent(mouseUp);
      
      // Create and dispatch click event
      const click = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      element.dispatchEvent(click);
      
      console.log("Force-clicked element:", element);
      return true;
    } catch (error) {
      console.error("Error force-clicking element:", error);
      return false;
    }
  }
  
  // Function to apply complexity filter with multiple methods
  function applyComplexityFilter(complexityText) {
    // Wait for facets to load
    setTimeout(() => {
      console.log(`Attempting to apply complexity filter: ${complexityText}`);
      
      // First, inspect all available complexity options for debugging
      inspectComplexityFilters();
      
      // Try several methods to click the complexity filter
      
      // Method 1: Direct querySelector with more specific selector
      const specificSelector = `#facet-weight .ais-RefinementList-label[title="${complexityText}"], #facet-weight .ais-RefinementList-labelText[title="${complexityText}"]`;
      const specificElement = document.querySelector(specificSelector);
      
      if (specificElement) {
        console.log(`Method 1: Found complexity filter with specific selector: "${complexityText}"`);
        forceClickElement(specificElement);
        return;
      }
      
      // Method 2: Find by text content
      const complexityItems = document.querySelectorAll('#facet-weight .ais-RefinementList-item');
      let found = false;
      
      complexityItems.forEach(item => {
        if (found) return; // Skip if already found
        
        const label = item.querySelector('.ais-RefinementList-label');
        if (!label) return;
        
        const text = label.textContent.trim();
        if (text === complexityText) {
          console.log(`Method 2: Found exact match for complexity: "${complexityText}"`);
          forceClickElement(label);
          found = true;
          return;
        }
      });
      
      // Method 3: Try clicking the actual checkbox
      if (!found) {
        complexityItems.forEach(item => {
          if (found) return; // Skip if already found
          
          const label = item.querySelector('.ais-RefinementList-label');
          const checkbox = item.querySelector('.ais-RefinementList-checkbox');
          
          if (!label || !checkbox) return;
          
          const text = label.textContent.trim();
          if (text === complexityText) {
            console.log(`Method 3: Found checkbox for complexity: "${complexityText}"`);
            checkbox.checked = true;
            const event = new Event('change', { bubbles: true });
            checkbox.dispatchEvent(event);
            found = true;
            return;
          }
        });
      }
      
      // Method 4: Try finding a partial match
      if (!found) {
        complexityItems.forEach(item => {
          if (found) return; // Skip if already found
          
          const label = item.querySelector('.ais-RefinementList-label');
          if (!label) return;
          
          const text = label.textContent.trim();
          if (text.includes(complexityText)) {
            console.log(`Method 4: Found partial match for complexity: "${text}" contains "${complexityText}"`);
            forceClickElement(label);
            found = true;
            return;
          }
        });
      }
      
      if (!found) {
        console.log(`Could not find any matches for complexity: "${complexityText}"`);
      }
    }, 1000); // Wait a full second to ensure UI is loaded
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
        // Use the improved player count filter function
        clickPlayerCountFilter(playerCount.value);
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
      applyComplexityFilter(complexityText);
      
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
