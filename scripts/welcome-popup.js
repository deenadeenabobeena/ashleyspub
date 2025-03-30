// Welcome Popup Functionality
document.addEventListener('DOMContentLoaded', function() {
  // Check if this is user's first visit
  const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
  
  if (!hasVisitedBefore) {
    // Add welcome popup HTML to the page
    const welcomePopupHTML = document.getElementById('welcome-popup-template').innerHTML;
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
  const skipButton = document.getElementById('skip-welcome');
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
  
  // Apply filters function
  function applyFilters() {
    // Get the instantsearch instance
    const searchPage = window.search;
    
    if (!searchPage) {
      console.error('Search instance not found');
      closeWelcomePopup();
      return;
    }
    
    // Apply player count filter
    if (playerCount.value) {
      // Convert the player count to the right format for refinement
      const playerValue = playerCount.value;
      // Apply the filter
      searchPage.addWidgets([
        instantsearch.widgets.configure({
          hierarchicalFacetsRefinements: {
            'players.level1': [playerValue]
          }
        })
      ]);
    }
    
    // Apply category filter
    if (gameCategory.value) {
      searchPage.addWidgets([
        instantsearch.widgets.configure({
          facetsRefinements: {
            categories: [gameCategory.value]
          }
        })
      ]);
    }
    
    // Apply playing time filter
    if (playingTime.value) {
      searchPage.addWidgets([
        instantsearch.widgets.configure({
          facetsRefinements: {
            playing_time: [playingTime.value]
          }
        })
      ]);
    }
    
    // Close the popup
    closeWelcomePopup();
    
    // Refresh the search to apply filters
    searchPage.refresh();
  }
  
  // Event listeners
  if (closeButton) {
    closeButton.addEventListener('click', closeWelcomePopup);
  }
  
  if (skipButton) {
    skipButton.addEventListener('click', closeWelcomePopup);
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

// Modified init function to expose the search instance
function modifiedInit(SETTINGS) {
  // Original init code...
  var configIndexName = '';
  switch (SETTINGS.algolia.sort_by) {
    case undefined:
    case 'asc(name)':
      configIndexName = SETTINGS.algolia.index_name;
      break;
    case 'asc(rank)':
    case 'desc(rating)':
      configIndexName = SETTINGS.algolia.index_name + '_rank_ascending';
      break;
    case 'desc(numrated)':
      configIndexName = SETTINGS.algolia.index_name + '_numrated_descending';
      break;
    case 'desc(numowned)':
      configIndexName = SETTINGS.algolia.index_name + '_numowned_descending';
      break;
    default:
      console.error("The provided config value for algolia.sort_by was invalid: " + SETTINGS.algolia.sort_by);
      break;
  }

  const search = instantsearch({
    indexName: configIndexName,
    searchClient: algoliasearch(
      SETTINGS.algolia.app_id,
      SETTINGS.algolia.api_key_search_only
    ),
    routing: true
  });

  // Expose the search instance globally
  window.search = search;

  search.on('render', on_render);

  var widgets = get_widgets(SETTINGS);
  search.addWidgets([
    widgets["search"],
    widgets["sort"],
    widgets["clear"],
    widgets["refine_categories"],
    widgets["refine_mechanics"],
    widgets["refine_players"],
    widgets["refine_weight"],
    widgets["refine_playingtime"],
    widgets["refine_min_age"],
    widgets["hits"],
    widgets["stats"],
    widgets["pagination"],
    widgets["refine_previousplayers"],
    widgets["refine_numplays"]
  ]);

  search.start();

  function set_bgg_name() {
    var title = SETTINGS.project.title;
    if (!title) {
      title = "All " + SETTINGS.boardgamegeek.user_name + "'s boardgames";
    }

    var title_tag = document.getElementsByTagName("title")[0];
    title_tag.innerHTML = title;
  }
  set_bgg_name();
  
  return search;
}

// Replace the original init function
window.originalInit = init;
window.init = modifiedInit;
