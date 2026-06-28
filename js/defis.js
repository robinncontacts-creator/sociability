/* ================================================
   defis.js — Logique des Défis
   Sociability App
   ================================================ */

const Defis = (() => {

  let currentDefi = null;
  let currentFilter = 'tous';

  /* ---- Rendu de la grille ---- */
  function render(filter = 'tous') {
    currentFilter = filter;
    const grid = document.getElementById('defi-grid');
    if (!grid) return;

    const catalogue = Data.DEFIS_CATALOGUE;
    const filtered  = filter === 'tous'
      ? catalogue
      : catalogue.filter(d => d.category === filter);

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <i class="ti ti-mood-empty" aria-hidden="true"></i>
          <p>Aucun défi dans cette catégorie pour l'instant.</p>
        </div>`;
      return;
    }

    grid.innerHTML = filtered.map(d => renderCard(d)).join('');
  }

  function renderCard(defi) {
    const done      = Data.isCompletedToday(defi.id);
    const count     = Data.getCompletedCount(defi.id);
    const maxCount  = defi.maxCount;
    const pct       = Math.min(Math.round((count / maxCount) * 100), 100);
    const diffLabel = { easy: 'Facile', medium: 'Moyen', hard: 'Difficile' }[defi.difficulty];
    const diffClass = { easy: 'diff-easy', medium: 'diff-med', hard: 'diff-hard' }[defi.difficulty];

    return `
      <div class="defi-item${done ? ' done' : ''}"
           onclick="Defis.openModal('${defi.id}')"
           role="button" tabindex="0"
           aria-label="${defi.title}${done ? ' (complété aujourd\'hui)' : ''}">
        <div class="defi-header">
          <div class="defi-emoji" aria-hidden="true">${defi.emoji}</div>
          <div class="defi-info">
            <div class="defi-name">${defi.title}</div>
            <div class="defi-meta">+${defi.xp} XP · ${diffLabel}</div>
          </div>
          <div class="diff-pill ${diffClass}">${diffLabel}</div>
        </div>
        <div class="defi-progress">
          <div class="defi-prog-labels">
            <span>${done ? '✓ Fait aujourd\'hui' : 'Progression totale'}</span>
            <span>${count}/${maxCount}</span>
          </div>
          <div class="prog-bar">
            <div class="prog-fill" style="width:${pct}%"></div>
          </div>
        </div>
      </div>`;
  }

  /* ---- Rendu des défis du jour (écran accueil) ---- */
  function renderDaily() {
    const list  = document.getElementById('daily-challenges-list');
    if (!list) return;
    const daily = Data.getDailyDefis();

    list.innerHTML = daily.map(d => {
      const done = Data.isCompletedToday(d.id);
      const catLabel = { social: 'Social', courage: 'Courage', groupe: 'Groupe' }[d.category];
      return `
        <div class="challenge-card${done ? ' done' : ''}"
             onclick="Defis.openModal('${d.id}')"
             role="button" tabindex="0">
          <div class="ch-top">
            <div class="ch-badge">${done ? 'Complété' : catLabel}</div>
            <div class="ch-xp">+${d.xp} XP</div>
          </div>
          <div class="ch-title">${d.emoji} ${d.title}</div>
          <div class="ch-desc">${d.desc}</div>
          ${done ? `<div class="ch-done-icon"><i class="ti ti-check" aria-hidden="true"></i></div>` : ''}
        </div>`;
    }).join('');
  }

  /* ---- Modal ---- */
  function openModal(id) {
    const defi = Data.DEFIS_CATALOGUE.find(d => d.id === id);
    if (!defi) return;
    currentDefi = defi;

    const done = Data.isCompletedToday(id);
    const diffLabel = { easy: 'Facile', medium: 'Moyen', hard: 'Difficile' }[defi.difficulty];

    document.getElementById('modal-emoji').textContent  = defi.emoji;
    document.getElementById('modal-title').textContent  = defi.title;
    document.getElementById('modal-desc').textContent   = defi.desc;
    document.getElementById('modal-xp').textContent     = done
      ? '✓ Déjà complété aujourd\'hui'
      : `Récompense : +${defi.xp} XP · ${diffLabel}`;
    document.getElementById('modal-textarea').value     = '';

    const btn = document.getElementById('modal-confirm-btn');
    if (done) {
      btn.textContent = 'Déjà fait aujourd\'hui 🎉';
      btn.style.opacity = '0.5';
      btn.style.cursor  = 'not-allowed';
    } else {
      btn.textContent = 'Marquer comme fait ✓';
      btn.style.opacity = '1';
      btn.style.cursor  = 'pointer';
    }

    const modal = document.getElementById('defi-modal');
    modal.classList.add('open');

    // Fermer en cliquant sur le fond
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };
  }

  function closeModal() {
    document.getElementById('defi-modal').classList.remove('open');
    currentDefi = null;
  }

  function confirmDefi() {
    if (!currentDefi) return;
    if (Data.isCompletedToday(currentDefi.id)) return;

    const note = document.getElementById('modal-textarea').value.trim();

    // Marquer complété
    Data.markCompleted(currentDefi.id);
    const newXP = Data.addXP(currentDefi.xp);

    // Ajouter entrée journal si note
    if (note) {
      Data.addJournalEntry({
        id:    Date.now().toString(),
        date:  new Date().toISOString(),
        mood:  Data.getMoodToday(),
        text:  note,
        defi:  currentDefi.title,
      });
    }

    closeModal();

    // Mettre à jour l'UI
    App.refreshHome();
    render(currentFilter);

    // Toast
    App.toast(`+${currentDefi.xp} XP — Défi complété ! 🔥`);

    // Check level up
    const levelInfo = Data.getLevelInfo(newXP);
    const prevXP    = newXP - currentDefi.xp;
    const prevLevel = Data.getLevelInfo(prevXP);
    if (levelInfo.current.level > prevLevel.current.level) {
      setTimeout(() => {
        App.toast(`🎉 Niveau ${levelInfo.current.level} atteint ! Tu es "${levelInfo.current.name}"`);
      }, 2000);
    }
  }

  /* ---- Keyboard nav ---- */
  function initKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }

  return {
    render,
    renderDaily,
    openModal,
    closeModal,
    confirmDefi,
    initKeyboard,
  };

})();