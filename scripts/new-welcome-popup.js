// Welcome Popup functionality
document.addEventListener('DOMContentLoaded', function() {
  // Create welcome popup HTML structure
  function createWelcomePopup() {
    const popup = document.createElement('div');
    popup.className = 'welcome-popup';
    popup.id = 'welcome-popup';
    
    popup.innerHTML = `
      <div class="welcome-content">
        <div class="close">×</div>
        <h2>Welcome to Boardom's End!</h2>
        <p>Find the perfect game for your next game night with our curated collection. Let us help you discover games tailored to your group.</p>
        
        <div class="player-selector">
          <h3>How many players will be joining?</h3>
          <div class="player-options">
            <button class="player-btn" data-players="1">1 Player</button>
            <button class="player-btn" data-players="2">2 Players</button>
            <button class="player-btn" data-players="3">3 Players</button>
            <button class="player-btn" data-players="4">4 Players</button>
            <button class="player-btn" data-players="5">5 Players</button>
            <button class="player-btn" data-players="6">6 Players</button>
            <button class="player-btn" data-players="7">7+ Players</button>
          </div>
        </div>
        
        <div class="complexity-selector">
          <h3>What complexity level are you looking for?</h3>
          <div class="complexity-slider-container">
            <input type="range" min="1" max="5" value="3" class="complexity-slider" id="complexity-slider">
            <div class="complexity-labels">
              <span>Light</span>
              <span>Light Medium</span>
              <span>Medium</span>
              <span>Medium Heavy</span>
              <span>Heavy</span>
            </div>
          </div>
          <div id="complexity-value" style="text-align: center; margin-top: 5px; font-weight: bold; color: #4a148c;">Medium</div>
        </div>
        
        <div class="sort-selector">
          <h3>What matters most to you?</h3>
          <div class="sort-options">
            <label>
              <input type="radio" name="sort-preference" value="best-rated" checked>
              Highest Quality Games
            </label>
            <label>
              <input type="radio" name="sort-preference" value="most-owned">
              Most Popular Games
            </label>
            <label>
              <input type="radio" name="sort-preference" value="alphabetical">
              Alphabetical Order
            </label>
          </div>
        </div>
        
        <div class="welcome-actions">
          <button class="welcome-btn primary" id="find-games-btn">Find Perfect Games</button>
          <button class="welcome-btn secondary" id="browse-all-btn">Browse All Games</button>
        </div>
        
        <div class="welcome-pref">
          <input type="checkbox" id="dont-show-again">
          <label for="dont-show-again">Don't show this again</label>
        </div>
      </div>
    `;
    
    document.body.appendChild(popup);
    setupWelcomePopupEvents(popup);
    
    return popup;
  }
  
  // Setup event listeners for the welcome popup
  function setupWelcomePopupEvents(popup) {
    // Close button functionality
    const closeBtn = popup.querySelector('.close');
    closeBtn.addEventListener('click', function() {
      closeWelcomePopup();
    });
    
    // Close when clicking outside the content
    popup.addEventListener('click', function(event) {
      if (event.target === popup) {
        closeWelcomePopup();
      }
    });
    
    // Player selection buttons
    const playerBtns = popup.querySelectorAll('.player-btn');
    playerBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        // Remove selected class from all buttons
        playerBtns.forEach(b => b.classList.remove('selected'));
        // Add selected class to clicked button
        this.classList.add('selected');
      });
    });
    
    // Complexity slider functionality
    const complexitySlider = document.getElementById('complexity-slider');
    const complexityValue = document.getElementById('complexity-value');
    
    // Array of complexity labels
    const complexityLabels = ['Light', 'Light Medium', 'Medium', 'Medium Heavy', 'Heavy'];
    
    // Update value display when slider moves
    if (complexitySlider) {
      complexitySlider.addEventListener('input', function() {
        const value = parseInt(this.value);
        complexityValue.textContent = complexityLabels[value - 1];
      });
    }
    
    // "Find Perfect Games" button
    const findGamesBtn = document.getElementById('find-games-btn');
    findGamesBtn.addEventListener('click', function() {
      const selectedPlayerBtn = popup.querySelector('.player-btn.selected');
      const sortPreference = popup.querySelector('input[name="sort-preference"]:checked').value;
      
      if (selectedPlayerBtn) {
        const playerCount = selectedPlayerBtn.getAttribute('data-players');
        applySearchPreferences(playerCount, sortPreference);
      } else {
        // If no player count selected, just apply sort preference and complexity
        applySearchPreferences(null, sortPreference);
      }
      
      // Check if "don't show again" is checked
      const dontShowAgain = document.getElementById('dont-show-again').checked;
      if (dontShowAgain) {
        localStorage.setItem('welcomePopupDismissed', 'true');
      }
      
      closeWelcomePopup();
    });
    
    // "Browse All Games" button
    const browseAllBtn = document.getElementById('browse-all-btn');
    browseAllBtn.addEventListener('click', function() {
      // Just close the popup without applying filters
      closeWelcomePopup();
      
      // Check if "don't show again" is checked
      const dontShowAgain = document.getElementById('dont-show-again').checked;
      if (dontShowAgain) {
        localStorage.setItem('welcomePopupDismissed', 'true');
      }
    });
    
    // Allow escape key to close popup
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && popup.classList.contains('active')) {
        closeWelcomePopup();
      }
    });
  }
  
  // Apply selected preferences to the Algolia search
  function applySearchPreferences(playerCount, sortPreference) {
    // Set the sort order based on preference
    const sortByWidget = document.querySelector('.ais-SortBy-select');
    if (sortByWidget) {
      switch (sortPreference) {
        case 'best-rated':
          // Find the option for BGG Rank
          for (let i = 0; i < sortByWidget.options.length; i++) {
            if (sortByWidget.options[i].text.includes('BGG Rank')) {
              sortByWidget.selectedIndex = i;
              // Trigger change event
              const event = new Event('change', { bubbles: true });
              sortByWidget.dispatchEvent(event);
              break;
            }
          }
          break;
        case 'most-owned':
          // Find the option for Number of owners
          for (let i = 0; i < sortByWidget.options.length; i++) {
            if (sortByWidget.options[i].text.includes('owners')) {
              sortByWidget.selectedIndex = i;
              // Trigger change event
              const event = new Event('change', { bubbles: true });
              sortByWidget.dispatchEvent(event);
              break;
            }
          }
          break;
        default: // 'alphabetical'
          // Find the option for Name
          for (let i = 0; i < sortByWidget.options.length; i++) {
            if (sortByWidget.options[i].text.includes('Name')) {
              sortByWidget.selectedIndex = i;
              // Trigger change event
              const event = new Event('change', { bubbles: true });
              sortByWidget.dispatchEvent(event);
              break;
            }
          }
      }
    }
    
    // Apply complexity filter if slider has been moved
    const complexitySlider = document.getElementById('complexity-slider');
    if (complexitySlider) {
      const complexityValue = parseInt(complexitySlider.value);
      const complexityLabels = ['Light', 'Light Medium', 'Medium', 'Medium Heavy', 'Heavy'];
      const selectedComplexity = complexityLabels[complexityValue - 1];
      
      // Find the complexity/weight facet
      const weightFacet = document.getElementById('facet-weight');
      if (weightFacet) {
        setTimeout(() => {
          const weightItems = weightFacet.querySelectorAll('.ais-RefinementList-item');
          weightItems.forEach(item => {
            const label = item.querySelector('.ais-RefinementList-label');
            if (label && label.textContent.trim() === selectedComplexity) {
              // This is the complexity level we want
              const checkbox = item.querySelector('.ais-RefinementList-checkbox');
              if (checkbox && !checkbox.checked) {
                // Click the label to check the checkbox
                label.click();
              }
            }
          });
        }, 500);
      }
    }
    
    // Apply player count filter if selected
    if (playerCount) {
      // Find the players facet
      const playersFacet = document.getElementById('facet-players');
      if (playersFacet) {
        // We need to find the correct refinement that matches our player count
        // and has "Best with" in its text
        setTimeout(() => {
          const allPlayerItems = playersFacet.querySelectorAll('.ais-HierarchicalMenu-item');
          
          // First try to find Best with X players
          let bestWithFound = false;
          allPlayerItems.forEach(item => {
            const label = item.querySelector('.ais-HierarchicalMenu-label');
            if (label && label.textContent.trim() === playerCount) {
              // This is the top-level item for our player count
              // Now we need to expand this item to see its children
              const link = item.querySelector('.ais-HierarchicalMenu-link');
              if (link) {
                link.click();
                
                // Now look for the "Best with X" child
                setTimeout(() => {
                  const childItems = item.querySelectorAll('.ais-HierarchicalMenu-item--child');
                  childItems.forEach(child => {
                    const childLabel = child.querySelector('.ais-HierarchicalMenu-label');
                    if (childLabel && childLabel.textContent.includes('Best with')) {
                      // This is what we want
                      const childLink = child.querySelector('.ais-HierarchicalMenu-link');
                      if (childLink) {
                        childLink.click();
                        bestWithFound = true;
                      }
                    }
                  });
                  
                  // If we couldn't find "Best with", just select the parent player count
                  if (!bestWithFound) {
                    link.click();
                  }
                }, 100);
              }
            }
          });
        }, 500);
      }
    }
  }
  
  // Function to close the welcome popup
  function closeWelcomePopup() {
    const popup = document.getElementById('welcome-popup');
    if (popup) {
      popup.classList.remove('active');
      setTimeout(() => {
        // Optional: remove from DOM entirely
        // popup.remove();
      }, 300);
    }
  }
  
  // Function to show the welcome popup
  function showWelcomePopup() {
    // Check if user has dismissed it before
    if (localStorage.getItem('welcomePopupDismissed') === 'true') {
      return;
    }
    
    let popup = document.getElementById('welcome-popup');
    if (!popup) {
      popup = createWelcomePopup();
    }
    
    // Allow time for DOM to be ready
    setTimeout(() => {
      popup.classList.add('active');
    }, 500);
  }
  
  // Add a button to trigger the welcome popup manually
  function addWelcomeButton() {
    const headerEl = document.querySelector('header.search');
    if (headerEl) {
      const welcomeBtn = document.createElement('button');
      welcomeBtn.id = 'show-welcome-btn';
      welcomeBtn.className = 'welcome-trigger-btn';
      welcomeBtn.innerHTML = '?';
      welcomeBtn.title = 'Find the perfect game';
      
      welcomeBtn.addEventListener('click', function() {
        let popup = document.getElementById('welcome-popup');
        if (!popup) {
          popup = createWelcomePopup();
        }
        popup.classList.add('active');
      });
      
      headerEl.appendChild(welcomeBtn);
      
      // Add styles for the welcome button
      const style = document.createElement('style');
      style.textContent = `
        .welcome-trigger-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #4a148c;
          color: white;
          border: none;
          font-size: 20px;
          font-weight: bold;
          cursor: pointer;
          margin-left: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .welcome-trigger-btn:hover {
          background: #0099cc;
          transform: scale(1.1);
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  // Initialize
  addWelcomeButton();
  showWelcomePopup();
});
