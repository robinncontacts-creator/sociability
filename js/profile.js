/* ================================================
   profile.js — Écran Profil
   Sociability App
   ================================================ */

const Profile = (() => {

  /* ---- Rendu complet ---- */
  async function render() {
    const profile   = await DB.getProfile();
    const xp        = profile?.xp    || 0;
    const streak    = profile?.streak || 0;
    const name      = profile?.name   || Data.getUser().name || 'Anonyme';
    const levelInfo = Data.getLevelInfo(xp);
    const journal   = await DB.getJournal();

    // Compter les défis
    let totalCompleted = 0;
    for (const defi of Data.DEFIS_CATALOGUE) {
      totalCompleted += await DB.getCompletedCount(defi.id);
    }

    const unlocked = await DB.getBadges();

    // Mettre à jour le DOM
    document.getElementById('prof-name-display').textContent  = name;
    document.getElementById('prof-level-name').textContent    = levelInfo.current.name;
    document.getElementById('prof-level-num').textContent     = `Niveau ${levelInfo.current.level}`;
    document.getElementById('prof-initials').textContent      = name.slice(0,2).toUpperCase();

    // Anneau de progression avatar
    const arc          = document.getElementById('prof-ring-arc');
    const circumference = 2 * Math.PI * 30;
    if (arc) {
      arc.style.strokeDasharray  = circumference;
      arc.style.strokeDashoffset = circumference * (1 - levelInfo.pct / 100);
    }

    // Stats
    document.getElementById('stat-xp').textContent      = xp.toLocaleString('fr-FR');
    document.getElementById('stat-streak').textContent  = streak;
    document.getElementById('stat-defis').textContent   = totalCompleted;
    document.getElementById('stat-journal').textContent = journal.length;
    document.getElementById('stat-badges').textContent  = unlocked.length;
    document.getElementById('stat-level').textContent   = levelInfo.current.level;

    // Barre XP
    const xpFill = document.getElementById('prof-xp-fill');
    if (xpFill) xpFill.style.width = levelInfo.pct + '%';

    document.getElementById('prof-xp-label').textContent = levelInfo.next
      ? `${xp} / ${levelInfo.next.minXP} XP → Lv.${levelInfo.next.level}`
      : `${xp} XP — Niveau max atteint !`;

    // Badge premium
    const premiumBadge = document.getElementById('prof-premium-badge');
    const isPrem       = await DB.isPremium();
    if (premiumBadge) premiumBadge.style.display = isPrem ? 'inline-flex' : 'none';

    // Rendu des badges
    await Badges.render('prof-badges-container');
  }

  /* ---- Édition du prénom ---- */
  function startEditName() {
    const display = document.getElementById('prof-name-display');
    const input   = document.getElementById('prof-name-input');
    const actions = document.getElementById('prof-name-actions');

    if (!display || !input) return;

    input.value         = display.textContent;
    display.style.display = 'none';
    input.style.display   = 'block';
    actions.style.display = 'flex';
    input.focus();
    input.select();
  }

  async function saveName() {
    const input   = document.getElementById('prof-name-input');
    const display = document.getElementById('prof-name-display');
    const actions = document.getElementById('prof-name-actions');
    const name    = input?.value.trim();

    if (!name || name.length < 2) {
      input?.classList.add('input-error');
      setTimeout(() => input?.classList.remove('input-error'), 600);
      return;
    }

    // Sauvegarder
    const profile   = await DB.getProfile();
    profile.name    = name;
    await DB.saveProfile(profile);

    // Mettre à jour localStorage aussi
    const localUser = Data.getUser();
    localUser.name  = name;
    Data.saveUser(localUser);

    // Mettre à jour l'UI
    display.textContent   = name;
    display.style.display = 'block';
    input.style.display   = 'none';
    actions.style.display = 'none';

    // Sync topbar
    const initialsEl = document.getElementById('avatar-initials');
    const profInit   = document.getElementById('prof-initials');
    const initials   = name.slice(0,2).toUpperCase();
    if (initialsEl) initialsEl.textContent = initials;
    if (profInit)   profInit.textContent   = initials;

    App.toast('Prénom mis à jour ✓');
  }

  function cancelEditName() {
    const display = document.getElementById('prof-name-display');
    const input   = document.getElementById('prof-name-input');
    const actions = document.getElementById('prof-name-actions');
    if (!display) return;
    display.style.display = 'block';
    input.style.display   = 'none';
    actions.style.display = 'none';
  }

  /* ---- Injection du HTML de l'écran profil ---- */
  function injectHTML() {
    if (document.getElementById('s-profile')) return;

    // Ajouter le bouton profil dans la nav
    const nav = document.querySelector('.bottom-nav');
    if (nav) {
      const btn = document.createElement('button');
      btn.className   = 'nav-btn';
      btn.setAttribute('aria-label', 'Profil');
      btn.onclick     = () => App.nav('profile', btn);
      btn.innerHTML   = `<i class="ti ti-user" aria-hidden="true"></i><span>Profil</span>`;
      nav.appendChild(btn);
    }

    const screen = document.createElement('div');
    screen.id        = 's-profile';
    screen.className = 'screen';
    screen.innerHTML = `

      <!-- Topbar -->
      <div class="topbar">
        <div class="page-title">Mon profil</div>
        <div id="prof-premium-badge" class="premium-badge" style="display:none">
          <i class="ti ti-crown" aria-hidden="true"></i> Premium
        </div>
      </div>

      <!-- Avatar + nom -->
      <div class="prof-hero">
        <div class="prof-avatar-wrap">
          <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden="true">
            <circle cx="36" cy="36" r="30" fill="none" stroke="var(--purple-pale)" stroke-width="4"/>
            <circle id="prof-ring-arc" cx="36" cy="36" r="30" fill="none"
              stroke="var(--purple-soft)" stroke-width="4" stroke-linecap="round"
              stroke-dasharray="188.5" stroke-dashoffset="188.5"
              transform="rotate(-90 36 36)" style="transition:stroke-dashoffset 1s ease"/>
          </svg>
          <div class="prof-avatar-inner" id="prof-initials">R</div>
        </div>

        <div class="prof-name-wrap">
          <div class="prof-name-display" id="prof-name-display">Robin</div>
          <input class="prof-name-input" id="prof-name-input" type="text"
            maxlength="20" style="display:none" placeholder="Ton prénom..."
            onkeydown="if(event.key==='Enter')Profile.saveName();if(event.key==='Escape')Profile.cancelEditName()" />
          <div class="prof-name-actions" id="prof-name-actions" style="display:none">
            <button class="prof-name-btn confirm" onclick="Profile.saveName()">
              <i class="ti ti-check"></i>
            </button>
            <button class="prof-name-btn cancel" onclick="Profile.cancelEditName()">
              <i class="ti ti-x"></i>
            </button>
          </div>
          <button class="prof-edit-btn" onclick="Profile.startEditName()" aria-label="Modifier le prénom">
            <i class="ti ti-pencil"></i> Modifier
          </button>
        </div>

        <div class="prof-level-wrap">
          <div class="prof-level-name" id="prof-level-name">Timide</div>
          <div class="prof-level-num"  id="prof-level-num">Niveau 1</div>
        </div>

        <!-- Barre XP -->
        <div class="prof-xp-bar-wrap">
          <div class="xp-track">
            <div class="xp-fill" id="prof-xp-fill" style="width:0%"></div>
          </div>
          <div class="prof-xp-label" id="prof-xp-label"></div>
        </div>
      </div>

      <!-- Grille de stats -->
      <div class="section-title">Statistiques</div>
      <div class="stats-grid">
        <div class="stat-tile">
          <div class="stat-tile-val" id="stat-xp">0</div>
          <div class="stat-tile-label">XP total</div>
        </div>
        <div class="stat-tile">
          <div class="stat-tile-val" id="stat-level">1</div>
          <div class="stat-tile-label">Niveau</div>
        </div>
        <div class="stat-tile">
          <div class="stat-tile-val" id="stat-streak">0</div>
          <div class="stat-tile-label">Jours 🔥</div>
        </div>
        <div class="stat-tile">
          <div class="stat-tile-val" id="stat-defis">0</div>
          <div class="stat-tile-label">Défis faits</div>
        </div>
        <div class="stat-tile">
          <div class="stat-tile-val" id="stat-journal">0</div>
          <div class="stat-tile-label">Entrées journal</div>
        </div>
        <div class="stat-tile">
          <div class="stat-tile-val" id="stat-badges">0</div>
          <div class="stat-tile-label">Badges</div>
        </div>
      </div>

      <!-- Badges -->
      <div class="section-title">Badges & Trophées</div>
      <div id="prof-badges-container" style="padding:0 20px 20px"></div>

    `;

    // Insérer avant le bottom-nav
    document.body.insertBefore(screen, document.querySelector('.bottom-nav'));
  }

  return {
    render,
    startEditName,
    saveName,
    cancelEditName,
    injectHTML,
  };

})();
