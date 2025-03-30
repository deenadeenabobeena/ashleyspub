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
          
          <!-- Step 1: Welcome and player count -->
          <div id="welcome-step-1" class="welcome-step">
            <h2>Welcome to Boardom's End!</h2>
            <p>Let's find the perfect game for your group. First, tell us how many players you have.</p>
            
            <div class="welcome-form">
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
            </div>
            
            <div class="progress-dots">
              <div class="dot active"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
            
            <div class="welcome-buttons">
              <button id="next-step-1" class="welcome-button">Next</button>
            </div>
          </div>
          
          <!-- Step 2: Game category preferences -->
          <div id="welcome-step-2" class="welcome-step" style="display: none;">
            <h2>What type of games do you enjoy?</h2>
            <p>Select a category that interests your group.</p>
            
            <div class="welcome-form">
              <div class="welcome-form-group">
                <label for="game-category">Game Category:</label>
                <select id="game-category">
                  <option value="">Any category</option>
                  <option value="Strategy">Strategy</option>
                  <option value="Party Game">Party Game</option>
                  <option value="Card Game">Card Game</option>
                  <option value="Cooperative">Cooperative</option>
                  <option value="Family">Family</option>
                  <option value="Dice">Dice</option>
                  <option value="Fantasy">Fantasy</option>
                  <option value="Economic">Economic</option>
                  <option value="Wargame">Wargame</option>
                </select>
              </div>
            </div>
            
            <div class="progress-dots">
              <div class="dot"></div>
              <div class="dot active"></div>
              <div class="dot"></div>
            </div>
            
            <div class="welcome-buttons">
              <button id="prev-step-2" class="welcome-button secondary">Back</button>
              <button id="next-step-2" class="welcome-button">Next</button>
            </div>
          </div>
          
          <!-- Step 3: Playing time -->
          <div id="welcome-step-3" class="welcome-step" style="display: none;">
            <h2>How much time do you have?</h2>
            <p>Select how long you'd like to play.</p>
            
            <div class="welcome-form">
              <div class="welcome-form-group">
                <label for="playing-time">Playing Time:</label>
                <select id="playing-time">
                  <option value="">Any length</option>
                  <option value="< 30min">Less than 30 minutes</option>
                  <option value="30min - 1h">30 minutes to 1 hour</option>
                  <option value="1-2h">1-2 hours</option>
                  <option value="2-3h">2-3 hours</option>
                  <option value="3-4h">3-4 hours</option>
                  <option value="> 4h">More than 4 hours</option>
                </select>
              </div>
            </div>
            
            <div class="progress-dots">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot active"></div>
            </div>
            
            <div class="welcome-buttons">
              <button id="prev-step-3" class="welcome-button secondary">Back</button>
              <button id="apply-filters" class="welcome-button">Find Games</button>
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
  const nextStep1Button = document.getElementById('next-step-1');
  const nextStep2Button = document.getElementById('next-step-2');
  const prevStep2Button = document.getElementById('prev-step-2');
  const prevStep3Button = document.getElementById('prev-step-3');
  const applyFiltersButton = document.getElementById('apply-filters');
  
  const step1 = document.getElementById('welcome-step-1');
  const step2 = document.getElementById('welcome-step-2');
  const step3 = document.getElementById('welcome-step-3');
  
  // User selections
  const playerCount = document.getElementById('player-count');
  const gameCategory = document.getElementById('game-category');
  const playingTime = document.getElementById('playing-time');
  
  // Close functionality
  function closeWelcomePopup() {
    welcomePopup.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
  
  // Navigation between steps
  function goToStep(step) {
    // Hide all steps
    step1.style.display = 'none';
    step2.style.display = 'none';
    step3.style.display = 'none';
    
    // Show the requested step
    if (step === 1) step1.style.display = 'block';
    if (step === 2) step2.style.display = 'block';
    if (step === 3) step3.style.display = 'block';
    
    // Update progress dots
    const dots = welcomePopup.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
      dot.classList.remove('active');
      if (index === step - 1) dot.classList.add('active');
    });
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
  
  // Apply filters function
  function applyFilters() {
    // Close the popup first
    closeWelcomePopup();
    
    // Short delay to ensure facets are loaded
    setTimeout(() => {
      console.log("Applying filters...");
      
      // Apply player count filter if selected
      if (playerCount.value) {
        console.log(`Applying player filter: ${playerCount.value}`);
        // Find and click the player count filter
        clickFacetLabel('#facet-players .ais-HierarchicalMenu-label', playerCount.value);
      }
      
      // Apply category filter if selected
      if (gameCategory.value) {
        console.log(`Applying category filter: ${gameCategory.value}`);
        // Find and click the category filter
        clickFacetLabel('#facet-categories .ais-RefinementList-label', gameCategory.value);
      }
      
      // Apply playing time filter if selected
      if (playingTime.value) {
        console.log(`Applying time filter: ${playingTime.value}`);
        // Find and click the playing time filter
        clickFacetLabel('#facet-playing-time .ais-RefinementList-label', playingTime.value);
      }
    }, 500);
  }
  
  // Event listeners
  if (closeButton) {
    closeButton.addEventListener('click', closeWelcomePopup);
  }
  
  if (nextStep1Button) {
    nextStep1Button.addEventListener('click', () => goToStep(2));
  }
  
  if (prevStep2Button) {
    prevStep2Button.addEventListener('click', () => goToStep(1));
  }
  
  if (nextStep2Button) {
    nextStep2Button.addEventListener('click', () => goToStep(3));
  }
  
  if (prevStep3Button) {
    prevStep3Button.addEventListener('click', () => goToStep(2));
  }
  
  if (applyFiltersButton) {
    applyFiltersButton.addEventListener('click', applyFilters);
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

// Function to reset the welcome popup (for testing)
function resetWelcomePopup() {
  localStorage.removeItem('hasVisitedBefore');
  window.location.reload();
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
