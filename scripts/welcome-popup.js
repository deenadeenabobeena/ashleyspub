// Welcome Popup Functionality
document.addEventListener('DOMContentLoaded', function() {
  // Remove the check for first visit - always show popup
  
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
  
  // We remove this line to prevent setting the flag that would prevent the popup in the future
  // localStorage.setItem('hasVisitedBefore', 'true');
});

// The rest of your code remains unchanged
