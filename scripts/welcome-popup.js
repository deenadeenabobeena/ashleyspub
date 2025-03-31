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
              
              <!-- Replaced slider with dropdown for complexity -->
              <div class="welcome-form-group">
                <label for="complexity-select">Game Complexity:</label>
                <select id="complexity-select">
                  <option value="">Any complexity</option>
                  <option value="Light">Light</option>
                  <option value="Light Medium">Light Medium</option>
                  <option value="Medium">Medium</option>
                  <option value="Medium Heavy">Medium Heavy</option>
                  <option value="Heavy">Heavy</option>
                </select>
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
  const complexitySelect = document.getElementById('complexity-select');
  const sortByWelcome = document.getElementById('sort-by-welcome');
  
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
  
  // Debug function to directly manipulate checkboxes
  function clickComplexityCheckbox(complexityText) {
    if (!complexityText) return false;
    
    console.log(`Looking for complexity checkbox for: "${complexityText}"`);
    
    // Wait for facets to load
    setTimeout(() => {
      // First, check if we can find the weight facet
      const weightFacet = document.getElementById('facet-weight');
      if (!weightFacet) {
        console.log("ERROR: facet-weight element not found!");
        return false;
      }
      
      // Find all labels in the weight facet
      const labels = weightFacet.querySelectorAll('.ais-RefinementList-label');
      console.log(`Found ${labels.length} complexity options`);
      
      // Log all available options
      labels.forEach((label, index) => {
        console.log(`Option ${index}: "${label.textContent.trim()}"`);
      });
      
      // Try to find and click the matching label
      let found = false;
      
      labels.forEach(label => {
        if (found) return;
        
        const text = label.textContent.trim();
        if (text === complexityText) {
          console.log(`Found exact match for complexity: "${text}"`);
          
          // Try direct click
          label.click();
          
          // Also try to find and check the checkbox
          const checkbox = label.querySelector('input[type="checkbox"]');
          if (checkbox) {
            checkbox.checked = true;
            const event = new Event('change', { bubbles: true });
            checkbox.dispatchEvent(event);
            console.log("Clicked checkbox directly");
          }
          
          found = true;
        }
      });
      
      if (!found) {
        // If no exact match, try case-insensitive match
        labels.forEach(label => {
          if (found) return;
          
          const text = label.textContent.trim();
          if (text.toLowerCase() === complexityText.toLowerCase()) {
            console.log(`Found case-insensitive match for complexity: "${text}"`);
            label.click();
            found = true;
          }
        });
      }
      
      if (!found) {
        console.log(`No match found for complexity: "${complexityText}"`);
        
        // Last resort: Try to get all checkboxes
        const checkboxes = weightFacet.querySelectorAll('input[type="checkbox"]');
        console.log(`Found ${checkboxes.length} checkboxes`);
        
        // Map of expected values to checkbox indices
        const complexityIndices = {
          'Light': 0,
          'Light Medium': 1,
          'Medium': 2,
          'Medium Heavy': 3,
          'Heavy': 4
        };
        
        const index = complexityIndices[complexityText];
        if (index !== undefined && index < checkboxes.length) {
          const checkbox = checkboxes[index];
          checkbox.checked = true;
          const event = new Event('change', { bubbles: true });
          checkbox.dispatchEvent(event);
          console.log(`Clicked checkbox at index ${index}`);
        }
      }
    }, 1000);
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
        clickPlayerCountFilter(playerCount.value);
      }
      
      // Apply complexity filter if selected
      if (complexitySelect.value) {
        console.log(`Applying complexity filter: ${complexitySelect.value}`);
        clickComplexityCheckbox(complexitySelect.value);
      }
      
      // Apply sort option
      if (sortByWelcome.value) {
        console.log(`Applying sort option: ${sortByWelcome.value}`);
        applySortOption(sortByWelcome.value);
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
