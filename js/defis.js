/* ================================================
   defis.js — Logique des Défis
   Sociability App
   ================================================ */

const Defis = (() => {

  let currentDefi   = null;
  let currentFilter = 'tous';

  /* ---- Rendu grille ---- */
  function render(filter = 'tous') {
    currentFilter = filter;
    const grid = document.getElementById('defi-grid');
    if (!grid) return;

    const catalogue = Data.DEFIS_CATALOGUE;
    const filtered  = filter === 'tous' ? catalogue : catalogue.filter(d => d.category === filter);

    if (filtered.length === 0) {
      grid.innerHTML = `<div class="empty-state"><i class="ti ti-mood-empty"></i><p>Aucun défi dans cette catégorie.</p></div>`;
      return;
    }

    grid.innerHTML = filtered.map(d => renderCard(d)).join('');
  }

  function renderCard(defi) {
    const accessible = Data.isDefiAccessible(defi);
    const done       = Data.isCompletedToday(defi.id);
    const count      = Data.getCompletedCount(defi.id);
    const pct        = Math.min(Math.round((count / defi.maxCount) * 100), 100);
    const diffLabel  = { easy: 'Facile', medium: 'Moyen', hard: 'Difficile' }[defi.difficulty];
    const diffClass  = { easy: 'diff-easy', medium: 'diff-med', hard: 'diff-hard' }[defi.difficulty];

    if (!accessible) {
      return `
        <div class="defi-item locked" onclick="Defis.openUnlockModal('${defi.id}')" role="button" tabindex="0">
          <div class="defi-header">
            <div class="defi-emoji locked-emoji" aria-hidden="true">🔒</div>
            <div class="defi-info">
              <div class="defi-name locked-name">${defi.title}</div>
              <div class="defi-meta">Niveau ${defi.minLevel} requis · +${defi.xp} XP</div>
            </div>
            <div class="level-required-pill">Lv.${defi.minLevel}</div>
          </div>
          <div class="locked-hint">Débloquer maintenant →</div>
        </div>`;
    }

    return `
      <div class="defi-item${done ? ' done' : ''}" onclick="Defis.openModal('${defi.id}')" role="button" tabindex="0">
        <div class="defi-header">
          <div class="defi-emoji" aria-hidden="true">${defi.emoji}</div>
          <div class="defi-info">
            <div class="defi-name">${defi.title}</div>
            <div class="defi-meta">+${defi.xp} XP · Lv.${defi.minLevel}</div>
          </div>
          <div class="diff-pill ${diffClass}">${diffLabel}</div>
        </div>
        <div class="defi-progress">
          <div class="defi-prog-labels">
            <span>${done ? '✓ Fait aujourd\'hui' : 'Progression totale'}</span>
            <span>${count}/${defi.maxCount}</span>
          </div>
          <div class="prog-bar"><div class="prog-fill" style="width:${pct}%"></div></div>
        </div>
      </div>`;
  }

  /* ---- Défis du jour (accueil) ---- */
  function renderDaily() {
    const list = document.getElementById('daily-challenges-list');
    if (!list) return;

    const daily = Data.getDailyDefis();
    if (daily.length === 0) {
      list.innerHTML = `<div style="padding:16px 20px;color:var(--text-muted);font-size:13px">Aucun défi quotidien disponible à ton niveau.</div>`;
      return;
    }

    list.innerHTML = daily.map(d => {
      const done     = Data.isCompletedToday(d.id);
      const catLabel = { social: 'Social', courage: 'Courage', groupe: 'Groupe' }[d.category];
      return `
        <div class="challenge-card${done ? ' done' : ''}" onclick="Defis.openModal('${d.id}')" role="button" tabindex="0">
          <div class="ch-top">
            <div class="ch-badge">${done ? 'Complété' : catLabel}</div>
            <div class="ch-xp">+${d.xp} XP</div>
          </div>
          <div class="ch-title">${d.emoji} ${d.title}</div>
          <div class="ch-desc">${d.desc}</div>
          ${done ? `<div class="ch-done-icon"><i class="ti ti-check"></i></div>` : ''}
        </div>`;
    }).join('');
  }

  /* ---- Modal défi ---- */
  function openModal(id) {
    const defi = Data.DEFIS_CATALOGUE.find(d => d.id === id);
    if (!defi) return;
    if (!Data.isDefiAccessible(defi)) { openUnlockModal(id); return; }
    currentDefi = defi;

    const done      = Data.isCompletedToday(id);
    const diffLabel = { easy: 'Facile', medium: 'Moyen', hard: 'Difficile' }[defi.difficulty];

    document.getElementById('modal-emoji').textContent = defi.emoji;
    document.getElementById('modal-title').textContent = defi.title;
    document.getElementById('modal-desc').textContent  = defi.desc;
    document.getElementById('modal-xp').textContent    = done
      ? '✓ Déjà complété aujourd\'hui'
      : `+${defi.xp} XP · ${diffLabel} · Lv.${defi.minLevel}`;
    document.getElementById('modal-textarea').value    = '';

    const btn = document.getElementById('modal-confirm-btn');
    btn.textContent     = done ? 'Déjà fait aujourd\'hui 🎉' : 'Marquer comme fait ✓';
    btn.style.opacity   = done ? '0.5' : '1';
    btn.style.cursor    = done ? 'not-allowed' : 'pointer';
    btn.onclick         = done ? null : confirmDefi;

    const modal = document.getElementById('defi-modal');
    modal.classList.add('open');
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };
  }

  function closeModal() {
    document.getElementById('defi-modal').classList.remove('open');
    currentDefi = null;
  }

  function confirmDefi() {
    if (!currentDefi || Data.isCompletedToday(currentDefi.id)) return;

    const note = document.getElementById('modal-textarea').value.trim();
    Data.markCompleted(currentDefi.id);
    const newXP = Data.addXP(currentDefi.xp);

    if (note) {
      Data.addJournalEntry({
        id:   Date.now().toString(),
        date: new Date().toISOString(),
        mood: Data.getMoodToday(),
        text: note,
        defi: currentDefi.title,
      });
    }

    closeModal();
    App.refreshHome();
    render(currentFilter);
    App.toast(`+${currentDefi.xp} XP — Défi complété ! 🔥`);

    const levelInfo = Data.getLevelInfo(newXP);
    const prevLevel = Data.getLevelInfo(newXP - currentDefi.xp);
    if (levelInfo.current.level > prevLevel.current.level) {
      setTimeout(() => App.toast(`🎉 Niveau ${levelInfo.current.level} — "${levelInfo.current.name}" !`), 2000);
    }
  }

  /* ---- Modal déblocage premium ---- */
  function openUnlockModal(id) {
    const defi = Data.DEFIS_CATALOGUE.find(d => d.id === id);
    document.getElementById('unlock-defi-name').textContent  = defi ? `"${defi.title}"` : 'ce défi';
    document.getElementById('unlock-defi-level').textContent = defi ? `Niveau ${defi.minLevel} requis` : '';
    document.getElementById('unlock-code-input').value       = '';
    document.getElementById('unlock-code-error').textContent = '';
    document.getElementById('unlock-price').textContent      = Data.PREMIUM_PRICE;

    const modal = document.getElementById('unlock-modal');
    modal.classList.add('open');
    modal.onclick = (e) => { if (e.target === modal) closeUnlockModal(); };
  }

  function closeUnlockModal() {
    document.getElementById('unlock-modal').classList.remove('open');
  }

  function submitCode() {
    const code  = document.getElementById('unlock-code-input').value;
    const error = document.getElementById('unlock-code-error');

    if (Data.checkCode(code)) {
      Data.unlockPremium();
      closeUnlockModal();
      render(currentFilter);
      renderDaily();
      App.refreshHome();
      App.toast('🎉 Accès total débloqué ! Bienvenue, Robin !');
    } else {
      error.textContent = '❌ Code invalide. Réessaie !';
      document.getElementById('unlock-code-input').focus();
    }
  }

  function simulatePay() {
    // Simulation paiement (pas de vrai backend)
    Data.unlockPremium();
    closeUnlockModal();
    render(currentFilter);
    renderDaily();
    App.refreshHome();
    App.toast('💳 Paiement simulé — Accès premium activé !');
  }

  /* ---- Keyboard ---- */
  function initKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { closeModal(); closeUnlockModal(); }
      if (e.key === 'Enter' && document.getElementById('unlock-modal').classList.contains('open')) {
        submitCode();
      }
    });
  }

  return {
    render,
    renderDaily,
    openModal,
    closeModal,
    confirmDefi,
    openUnlockModal,
    closeUnlockModal,
    submitCode,
    simulatePay,
    initKeyboard,
  };

})();
