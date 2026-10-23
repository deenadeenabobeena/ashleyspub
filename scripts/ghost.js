// A friendly Halloween ghost: flies in from the left and offers to show the spooky games.
//
// This is seasonal and self-contained. After Halloween, delete this file and the
// <script src="scripts/ghost.js"></script> line in index.html. (Even if you forget,
// he only comes out between the dates below.)
//
// He only appears when there are games tagged "halloween" in the spreadsheet,
// and only once per visit: after he is dismissed or clicked he stays away until
// the browser tab is closed.

// Active from START through END, written as [month, day].
var GHOST_START = [10, 15];
var GHOST_END = [11, 1];

function start_halloween_ghost(SETTINGS) {
  var now = new Date();
  var today = (now.getMonth() + 1) * 100 + now.getDate();
  if (today < GHOST_START[0] * 100 + GHOST_START[1] || today > GHOST_END[0] * 100 + GHOST_END[1]) {
    return;
  }

  try {
    if (sessionStorage.getItem('halloween-ghost-done')) return;
  } catch (e) { /* storage blocked: just show him */ }

  // Only come out if there are Halloween games to show
  var client = algoliasearch(SETTINGS.algolia.app_id, SETTINGS.algolia.api_key_search_only);
  var index = client.initIndex(SETTINGS.algolia.index_name);
  index.search('', { facetFilters: ['season:halloween'], hitsPerPage: 0 })
    .then(function(res) {
      if (res.nbHits > 0) wait_for_welcome_popup(show_ghost);
    })
    .catch(function(error) {
      console.error('The ghost could not check for Halloween games:', error);
    });
}

// Let people close the welcome popup before the ghost flies in (gives up after a minute)
function wait_for_welcome_popup(callback) {
  var waited = 0;
  var timer = setInterval(function() {
    var popup = document.getElementById('welcome-popup');
    var is_open = popup && popup.style.display !== 'none';
    waited += 500;
    if (!is_open || waited > 60000) {
      clearInterval(timer);
      setTimeout(callback, 700);
    }
  }, 500);
}

function mark_ghost_done() {
  try { sessionStorage.setItem('halloween-ghost-done', '1'); } catch (e) { /* fine */ }
}

// Turn on the Halloween filter and scroll to the results
function show_halloween_games() {
  try {
    pub_search.helper.addDisjunctiveFacetRefinement('season', 'halloween').search();
    var results = document.querySelector('.results');
    if (results) results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) {
    console.error('The ghost could not turn on the Halloween filter:', error);
  }
}

function add_ghost_styles() {
  var css = [
    '.hg-wrap { position: fixed; right: 22px; bottom: 22px; z-index: 1; display: flex;',
    '  flex-direction: column; align-items: flex-end; gap: 8px; pointer-events: none; }',
    '.hg-bubble { position: relative; max-width: 210px; padding: 12px 16px 12px 14px;',
    '  background: #fff; color: var(--main, #4a148c); border-radius: 12px; font-size: 14px;',
    '  font-weight: 700; line-height: 18px; box-shadow: 0 3px 12px rgba(0,0,0,.25);',
    '  pointer-events: auto; transform-origin: bottom right;',
    '  animation: hg-pop .4s ease-out 3.7s both; }',
    '.hg-bubble:after { content: ""; position: absolute; right: 34px; bottom: -8px;',
    '  border: 8px solid transparent; border-bottom: 0; border-top-color: #fff; }',
    '.hg-go { display: block; margin-top: 8px; padding: 5px 10px; border: 0; border-radius: 4px;',
    '  background: var(--hl, #0099cc); color: #fff; font: inherit; font-size: 13px; cursor: pointer; }',
    '.hg-go[hidden], .hg-x[hidden] { display: none; }',
    '.hg-x { position: absolute; top: 0; right: 4px; padding: 2px 5px; border: 0; background: none;',
    '  color: #999; font-size: 18px; line-height: 18px; cursor: pointer; }',
    '.hg-fly { animation: hg-fly-in 3.6s ease-out both; }',
    '.hg-ghost { display: block; width: 74px; filter: drop-shadow(0 4px 6px rgba(0,0,0,.3));',
    '  animation: hg-bob 3s ease-in-out 3.6s infinite alternate; }',
    '.hg-leaving .hg-fly { animation: hg-leave 1.5s ease-in both; }',
    '@keyframes hg-fly-in {',
    '  0% { transform: translate(calc(-100vw + 110px), 40px); }',
    '  35% { transform: translate(-62vw, -50px); }',
    '  65% { transform: translate(-28vw, 18px); }',
    '  100% { transform: translate(0, 0); } }',
    '@keyframes hg-bob { from { transform: translateY(0); } to { transform: translateY(-7px); } }',
    '@keyframes hg-pop { from { opacity: 0; visibility: hidden; transform: scale(.6); }',
    '  to { opacity: 1; visibility: visible; transform: scale(1); } }',
    '@keyframes hg-leave { to { transform: translate(40vw, -60vh); opacity: 0; } }',
    '@media (prefers-reduced-motion: reduce) {',
    '  .hg-fly, .hg-ghost, .hg-bubble, .hg-leaving .hg-fly { animation: none; }',
    '  .hg-leaving .hg-fly { opacity: 0; } }'
  ].join('\n');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
}

function show_ghost() {
  add_ghost_styles();

  var wrap = document.createElement('div');
  wrap.className = 'hg-wrap';
  wrap.setAttribute('role', 'complementary');
  wrap.setAttribute('aria-label', 'Halloween ghost');
  // Fixed markup only, no data from the site goes into it
  wrap.innerHTML =
    '<div class="hg-bubble" aria-live="polite">' +
      '<button type="button" class="hg-x" aria-label="Dismiss the ghost">×</button>' +
      '<span class="hg-text">Looking for something spooky?</span>' +
      '<button type="button" class="hg-go">Show me!</button>' +
    '</div>' +
    '<div class="hg-fly">' +
      '<svg class="hg-ghost" viewBox="0 0 80 96" role="img" aria-label="A friendly ghost">' +
        '<path d="M10 90V40C10 18 24 6 40 6s30 12 30 34v50l-10-8-10 8-10-8-10 8-10-8z" fill="#fff" stroke="#4a148c" stroke-width="3" stroke-linejoin="round"/>' +
        '<circle cx="30" cy="42" r="5" fill="#222"/><circle cx="50" cy="42" r="5" fill="#222"/>' +
        '<ellipse cx="40" cy="58" rx="4" ry="5.5" fill="#222"/>' +
        '<circle cx="23" cy="53" r="4" fill="#f4a6c0" opacity=".7"/><circle cx="57" cy="53" r="4" fill="#f4a6c0" opacity=".7"/>' +
      '</svg>' +
    '</div>';

  // First in the page, so game cards and popups (which come later) are drawn on top of him
  document.body.insertBefore(wrap, document.body.firstChild);

  var text = wrap.querySelector('.hg-text');
  var go = wrap.querySelector('.hg-go');
  var close = wrap.querySelector('.hg-x');

  function leave() {
    wrap.classList.add('hg-leaving');
    setTimeout(function() { wrap.remove(); }, 1700);
  }

  go.addEventListener('click', function() {
    mark_ghost_done();
    show_halloween_games();
    text.textContent = 'Boo! Here you go.';
    go.hidden = true;
    close.hidden = true;
    setTimeout(leave, 1800);
  });

  close.addEventListener('click', function() {
    mark_ghost_done();
    leave();
  });
}
