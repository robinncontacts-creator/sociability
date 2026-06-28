/* ================================================
   journal.js — Journal Social
   Sociability App
   ================================================ */

const Journal = (() => {

  let selectedMood = '🙂';

  /* ---- Rendu complet ---- */
  function render() {
    renderStats();
    renderEntries();
    restoreMood();
  }

  /* ---- Stats rapides ---- */
  function renderStats() {
    const entries  = Data.getJournal();
    const today    = Data.todayStr();
    const thisWeek = entries.filter(e => {
      const d = new Date(e.date);
      const now = new Date();
      const diff = (now - d) / (1000 * 60 * 60 * 24);
      return diff < 7;
    }).length;

    // Injecter les stats si le conteneur existe
    let statsEl = document.querySelector('.journal-stats');
    if (!statsEl) {
      statsEl = document.createElement('div');
      statsEl.className = 'journal-stats';
      const actionsEl = document.querySelector('.journal-actions');
      if (actionsEl) actionsEl.after(statsEl);
    }

    statsEl.innerHTML = `
      <div class="stat-card">
        <div class="stat-label">Total entrées</div>
        <div class="stat-value">${entries.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Cette semaine</div>
        <div class="stat-value">${thisWeek}</div>
      </div>`;
  }

  /* ---- Liste des entrées ---- */
  function renderEntries() {
    const list = document.getElementById('journal-list');
    if (!list) return;

    const entries = Data.getJournal();

    if (entries.length === 0) {
      list.innerHTML = `
        <div class="journal-empty">
          <i class="ti ti-notebook" aria-hidden="true"></i>
          <p>Ton journal est vide.<br>Écris ta première entrée après un défi !</p>
        </div>`;
      return;
    }

    list.innerHTML = entries.map(entry => renderEntry(entry)).join('');
  }

  function renderEntry(entry) {
    const date = Data.formatRelativeDate(entry.date);
    const defiTag = entry.defi
      ? `<div class="entry-defi-tag"><i class="ti ti-check" aria-hidden="true"></i>${entry.defi}</div>`
      : '';

    return `
      <div class="entry-card">
        <div class="entry-date">${date}</div>
        <div class="entry-mood">${entry.mood || '🙂'}</div>
        <div class="entry-text">${escapeHtml(entry.text)}</div>
        ${defiTag}
      </div>`;
  }

  /* ---- Humeur ---- */
  function selectMood(btn, emoji) {
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('sel'));
    btn.classList.add('sel');
    selectedMood = emoji;
    Data.saveMoodToday(emoji);
  }

  function restoreMood() {
    const savedMood = Data.getMoodToday();
    selectedMood = savedMood;
    const emojis = ['😰','😟','😐','🙂','😄'];
    const idx = emojis.indexOf(savedMood);
    const btns = document.querySelectorAll('.mood-btn');
    btns.forEach(b => b.classList.remove('sel'));
    if (idx !== -1 && btns[idx]) btns[idx].classList.add('sel');
  }

  /* ---- Modal ---- */
  function openModal() {
    document.getElementById('journal-textarea').value = '';
    const modal = document.getElementById('journal-modal');
    modal.classList.add('open');
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };
    setTimeout(() => document.getElementById('journal-textarea').focus(), 100);
  }

  function closeModal() {
    document.getElementById('journal-modal').classList.remove('open');
  }

  function saveEntry() {
    const text = document.getElementById('journal-textarea').value.trim();
    if (!text) {
      document.getElementById('journal-textarea').focus();
      return;
    }

    Data.addJournalEntry({
      id:   Date.now().toString(),
      date: new Date().toISOString(),
      mood: selectedMood,
      text,
    });

    closeModal();
    renderStats();
    renderEntries();
    App.toast('Entrée ajoutée au journal ✓');
  }

  /* ---- Utilitaire sécurité ---- */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  return {
    render,
    renderEntries,
    selectMood,
    openModal,
    closeModal,
    saveEntry,
  };

})();