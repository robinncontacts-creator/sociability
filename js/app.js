/* ================================================
   app.js — Navigation, Init, État Global
   Sociability App
   ================================================ */

const App = (() => {

  let toastTimer     = null;
  let badgeToastTimer = null;

  /* ---- Initialisation principale ---- */
  async function init(skipOnboarding = false) {
    // 1. Onboarding si première visite
    if (!skipOnboarding && !Onboarding.isDone()) {
      Onboarding.show();
      return;
    }

    // 2. Auth Firebase (anonyme)
    if (typeof Auth !== 'undefined') {
      await Auth.init();
    }

    // 3. Notifications
    Notifs.init();

    // 4. Rendu des écrans
    refreshHome();
    Defis.render('tous');
    Rank.render();
    Journal.render();

    // 5. Keyboard
    Defis.initKeyboard();

    // 6. Salutation
    setGreeting();

    // 7. Vérifier les badges au démarrage
    setTimeout(async () => {
      const newBadges = await Badges.checkAndUnlock();
      for (const badge of newBadges) {
        await showBadgeToast(badge);
        Notifs.sendBadgeUnlocked(badge);
        await sleep(3500);
      }
    }, 1500);

    console.log('Sociability — App initialisée ✓');
  }

  /* ---- Navigation entre écrans ---- */
  function nav(id, btn) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    const screen = document.getElementById('s-' + id);
    if (screen) screen.classList.add('active');
    if (btn) btn.classList.add('active');

    if (id === 'home')    refreshHome();
    if (id === 'rank')    Rank.render();
    if (id === 'journal') Journal.render();
    if (id === 'profile') Profile.render();
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

  /* ---- Rafraîchir l'accueil ---- */
  async function refreshHome() {
    const profile   = await DB.getProfile();
    const xp        = profile?.xp     || Data.getUser().xp || 0;
    const streak    = profile?.streak || Data.getUser().streak || 0;
    const name      = profile?.name   || Data.getUser().name || 'Robin';
    const levelInfo = Data.getLevelInfo(xp);

    // Anneau avatar
    updateAvatarRing(levelInfo.pct);

    // Initiales
    const initials = name.slice(0,2).toUpperCase();
    const initialsEl = document.getElementById('avatar-initials');
    if (initialsEl) initialsEl.textContent = initials;

    // Streak
    const streakEl = document.getElementById('streak-count');
    if (streakEl) streakEl.textContent = streak + (streak <= 1 ? ' jour' : ' jours');

    // Niveau
    const levelEl = document.getElementById('level-display');
    if (levelEl) levelEl.textContent = 'Lv. ' + levelInfo.current.level;

    // XP bar
    const fillEl  = document.getElementById('xp-fill');
    const curLabel = document.getElementById('xp-current-label');
    const nxtLabel = document.getElementById('xp-next-label');
    if (fillEl)   fillEl.style.width = levelInfo.pct + '%';
    if (curLabel) curLabel.textContent = levelInfo.next ? `XP : ${xp} / ${levelInfo.next.minXP}` : `XP : ${xp} (max)`;
    if (nxtLabel) nxtLabel.textContent = levelInfo.next ? `→ Lv. ${levelInfo.next.level}` : '✓ Max';

    // Défis du jour
    Defis.renderDaily();
  }

  /* ---- Anneau SVG avatar ---- */
  function updateAvatarRing(pct) {
    const arc = document.getElementById('ring-arc');
    if (!arc) return;
    const circumference = 2 * Math.PI * 19;
    arc.style.strokeDasharray  = circumference;
    arc.style.strokeDashoffset = circumference * (1 - pct / 100);
  }

  /* ---- Salutation ---- */
  function setGreeting() {
    const el   = document.getElementById('greeting');
    if (!el) return;
    const name = Data.getUser().name || 'toi';
    const hour = new Date().getHours();
    const prefix = hour >= 18 ? 'Bonsoir' : hour < 6 ? 'Bonne nuit' : 'Bonjour';
    el.textContent = `${prefix}, ${name} 👋`;
  }

  /* ---- Toast simple ---- */
  function toast(message, duration = 3000) {
    const el   = document.getElementById('toast');
    const text = document.getElementById('toast-text');
    if (!el || !text) return;
    if (toastTimer) { clearTimeout(toastTimer); el.classList.remove('show'); }
    text.textContent = message;
    void el.offsetWidth;
    el.classList.add('show');
    toastTimer = setTimeout(() => { el.classList.remove('show'); toastTimer = null; }, duration);
  }

  /* ---- Toast badge (plus grand, en bas) ---- */
  async function showBadgeToast(badge) {
    // Créer ou récupérer l'élément
    let el = document.getElementById('badge-toast');
    if (!el) {
      el = document.createElement('div');
      el.id        = 'badge-toast';
      el.className = 'badge-toast';
      el.innerHTML = `
        <div class="badge-toast-emoji" id="bt-emoji"></div>
        <div class="badge-toast-info">
          <div class="badge-toast-label">Badge débloqué !</div>
          <div class="badge-toast-title" id="bt-title"></div>
          <div class="badge-toast-desc"  id="bt-desc"></div>
        </div>`;
      document.body.appendChild(el);
    }

    document.getElementById('bt-emoji').textContent = badge.emoji;
    document.getElementById('bt-title').textContent = badge.title;
    document.getElementById('bt-desc').textContent  = badge.desc;

    void el.offsetWidth;
    el.classList.add('show');
    await sleep(3000);
    el.classList.remove('show');
    await sleep(400);
  }

  /* ---- Utilitaire ---- */
  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  /* ---- Lancer ---- */
  document.addEventListener('DOMContentLoaded', () => {
    // Injecter profil et onboarding dans le DOM
    Onboarding.injectHTML();
    Profile.injectHTML();
    init();
  });

  return { nav, switchTab, refreshHome, toast, showBadgeToast, init };

})();
