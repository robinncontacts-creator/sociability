/* ================================================
   app.js — Navigation, Init, État Global
   Sociability App
   ================================================ */

const App = (() => {

  let toastTimer = null;

  /* ---- Initialisation ---- */
  function init() {
    Data.updateStreak();
    refreshHome();
    Defis.renderDaily();
    Defis.render('tous');
    Rank.render();
    Journal.render();
    Defis.initKeyboard();
    setGreeting();
    console.log('Sociability — App initialisée ✓');
  }

  /* ---- Navigation entre écrans ---- */
  function nav(id, btn) {
    // Cacher tous les écrans
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    // Désactiver tous les boutons nav
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    // Activer l'écran cible
    const screen = document.getElementById('s-' + id);
    if (screen) screen.classList.add('active');
    if (btn) btn.classList.add('active');

    // Rafraîchir les données si nécessaire
    if (id === 'home')    refreshHome();
    if (id === 'rank')    Rank.render();
    if (id === 'journal') Journal.render();
  }

  /* ---- Onglets défis ---- */
  function switchTab(btn, filter) {
    document.querySelectorAll('.tab').forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    Defis.render(filter);
  }

  /* ---- Rafraîchir l'écran Accueil ---- */
  function refreshHome() {
    const user      = Data.getUser();
    const levelInfo = Data.getLevelInfo(user.xp);

    // Anneau de progression avatar
    updateAvatarRing(levelInfo.pct);

    // Initiales avatar
    const initialsEl = document.getElementById('avatar-initials');
    if (initialsEl) initialsEl.textContent = Data.getUserInitials();

    // Streak
    const streakEl = document.getElementById('streak-count');
    if (streakEl) {
      const s = user.streak || 0;
      streakEl.textContent = s + (s <= 1 ? ' jour' : ' jours');
    }

    // Niveau
    const levelEl = document.getElementById('level-display');
    if (levelEl) levelEl.textContent = 'Lv. ' + levelInfo.current.level;

    // Barre XP
    const fillEl    = document.getElementById('xp-fill');
    const trackEl   = document.getElementById('xp-track');
    const curLabel  = document.getElementById('xp-current-label');
    const nextLabel = document.getElementById('xp-next-label');

    if (fillEl) fillEl.style.width = levelInfo.pct + '%';
    if (trackEl) trackEl.setAttribute('aria-valuenow', levelInfo.pct);

    if (curLabel) {
      curLabel.textContent = levelInfo.next
        ? `XP : ${user.xp} / ${levelInfo.next.minXP}`
        : `XP : ${user.xp} (max)`;
    }
    if (nextLabel) {
      nextLabel.textContent = levelInfo.next
        ? `→ Lv. ${levelInfo.next.level}`
        : '✓ Niveau max';
    }

    // Rafraîchir aussi les défis du jour
    Defis.renderDaily();
  }

  /* ---- Anneau SVG autour de l'avatar ---- */
  function updateAvatarRing(pct) {
    const arc = document.getElementById('ring-arc');
    if (!arc) return;
    const circumference = 2 * Math.PI * 19; // r=19
    const offset = circumference * (1 - pct / 100);
    arc.style.strokeDasharray  = circumference;
    arc.style.strokeDashoffset = offset;
  }

  /* ---- Salutation selon l'heure ---- */
  function setGreeting() {
    const greetingEl = document.getElementById('greeting');
    if (!greetingEl) return;

    const user = Data.getUser();
    const hour = new Date().getHours();
    let prefix = 'Bonjour';
    if (hour >= 18) prefix = 'Bonsoir';
    else if (hour < 6) prefix = 'Bonne nuit';

    greetingEl.textContent = `${prefix}, ${user.name} 👋`;
  }

  /* ---- Toast notification ---- */
  function toast(message, duration = 3000) {
    const el   = document.getElementById('toast');
    const text = document.getElementById('toast-text');
    if (!el || !text) return;

    // Annuler un éventuel toast en cours
    if (toastTimer) {
      clearTimeout(toastTimer);
      el.classList.remove('show');
    }

    text.textContent = message;
    // Forcer un reflow pour relancer l'animation
    void el.offsetWidth;
    el.classList.add('show');

    toastTimer = setTimeout(() => {
      el.classList.remove('show');
      toastTimer = null;
    }, duration);
  }

  /* ---- Lancer au chargement ---- */
  document.addEventListener('DOMContentLoaded', init);

  return {
    nav,
    switchTab,
    refreshHome,
    toast,
  };

})();