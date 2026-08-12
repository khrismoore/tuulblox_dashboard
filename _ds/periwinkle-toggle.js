/* Periwinkle Dark theme toggle for the tuulblox mockups.
   Flips <html data-theme> between "nocturne" (default) and "periwinkle",
   persists the choice, and rewrites the grey storyboard captions so they
   name the active theme. Pairs with _ds/periwinkle-dark.css. */
(function () {
  var LS = 'tuulblox_theme';
  var root = document.documentElement;
  var current = 'nocturne';
  try { if (localStorage.getItem(LS) === 'periwinkle') current = 'periwinkle'; } catch (e) {}

  // Apply the stored theme immediately so colors are right the moment
  // .sb-wrap renders (the CSS is gated on this attribute).
  root.setAttribute('data-theme', current);

  // --- caption rewrite: name the active theme, reversibly ------------------
  function swapCaptions(theme) {
    var notes = document.querySelectorAll('.sb-note');
    for (var i = 0; i < notes.length; i++) {
      var el = notes[i];
      if (el.getAttribute('data-pw-orig') === null) {
        el.setAttribute('data-pw-orig', el.innerHTML);
      }
      var orig = el.getAttribute('data-pw-orig');
      var next = (theme === 'periwinkle')
        ? orig.replace(/Nocturne/g, 'Periwinkle Dark').replace(/blurple/g, 'periwinkle')
        : orig;
      // Only write when it actually changes — writing innerHTML is a DOM
      // mutation, so an unconditional write here can storm any observer.
      if (el.innerHTML !== next) el.innerHTML = next;
    }
  }

  function updateButton(theme) {
    var lbl = document.querySelector('#pw-theme-toggle .pw-label');
    if (lbl) lbl.textContent = 'Theme · ' + (theme === 'periwinkle' ? 'Periwinkle' : 'Nocturne');
  }

  function applyTheme(theme) {
    current = theme;
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem(LS, theme); } catch (e) {}
    updateButton(theme);
    swapCaptions(theme);
  }

  function buildButton() {
    if (document.getElementById('pw-theme-toggle')) return;
    var btn = document.createElement('button');
    btn.id = 'pw-theme-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Switch between Nocturne and Periwinkle Dark themes');
    btn.innerHTML = '<span class="sw"></span><span class="pw-label"></span>';
    btn.addEventListener('click', function () {
      applyTheme(current === 'periwinkle' ? 'nocturne' : 'periwinkle');
    });
    document.body.appendChild(btn);
    updateButton(current);
  }

  function init() {
    buildButton();
    swapCaptions(current);
    // The DC runtime can inject .sb-note after load. Instead of a
    // MutationObserver (which would re-fire on our own innerHTML writes),
    // re-apply on a few timed retries. swapCaptions only writes on change,
    // so these settle to a no-op once the notes are present.
    [150, 500, 1200, 2500].forEach(function (t) { setTimeout(function () { swapCaptions(current); }, t); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
