/* ================================================
   badges.js — Badges & Trophées
   Sociability App
   ================================================ */

const Badges = (() => {

  /* ---- Catalogue complet des badges ---- */
  const CATALOGUE = [

    /* ── Premiers pas ── */
    {
      id:       'premier_defi',
      emoji:    '🌱',
      title:    'Premier pas',
      desc:     'Complète ton tout premier défi.',
      category: 'debut',
      secret:   false,
      check:    (stats) => stats.totalCompleted >= 1,
    },
    {
      id:       'serie_3',
      emoji:    '🔥',
      title:    'On chauffe',
      desc:     'Maintiens une série de 3 jours consécutifs.',
      category: 'streak',
      secret:   false,
      check:    (stats) => stats.streak >= 3,
    },
    {
      id:       'serie_7',
      emoji:    '🔥🔥',
      title:    'Semaine de feu',
      desc:     'Maintiens une série de 7 jours consécutifs.',
      category: 'streak',
      secret:   false,
      check:    (stats) => stats.streak >= 7,
    },
    {
      id:       'serie_30',
      emoji:    '💎',
      title:    'Un mois de courage',
      desc:     '30 jours de série. Tu es une légende.',
      category: 'streak',
      secret:   false,
      check:    (stats) => stats.streak >= 30,
    },

    /* ── XP & Niveaux ── */
    {
      id:       'xp_100',
      emoji:    '⭐',
      title:    'Cent points',
      desc:     'Atteins 100 XP.',
      category: 'xp',
      secret:   false,
      check:    (stats) => stats.xp >= 100,
    },
    {
      id:       'xp_500',
      emoji:    '🌟',
      title:    'Cinq cents XP',
      desc:     'Atteins 500 XP.',
      category: 'xp',
      secret:   false,
      check:    (stats) => stats.xp >= 500,
    },
    {
      id:       'xp_1000',
      emoji:    '💫',
      title:    'Millénaire',
      desc:     'Atteins 1000 XP.',
      category: 'xp',
      secret:   false,
      check:    (stats) => stats.xp >= 1000,
    },
    {
      id:       'niveau_5',
      emoji:    '🚀',
      title:    'À mi-chemin',
      desc:     'Atteins le niveau 5.',
      category: 'niveau',
      secret:   false,
      check:    (stats) => stats.level >= 5,
    },
    {
      id:       'niveau_10',
      emoji:    '👑',
      title:    'Légendaire',
      desc:     'Atteins le niveau maximum : Lv.10.',
      category: 'niveau',
      secret:   false,
      check:    (stats) => stats.level >= 10,
    },

    /* ── Défis ── */
    {
      id:       'defis_5',
      emoji:    '🎯',
      title:    'Cinquième défi',
      desc:     'Complète 5 défis au total.',
      category: 'defis',
      secret:   false,
      check:    (stats) => stats.totalCompleted >= 5,
    },
    {
      id:       'defis_20',
      emoji:    '🏅',
      title:    'Vingt défis',
      desc:     'Complète 20 défis au total.',
      category: 'defis',
      secret:   false,
      check:    (stats) => stats.totalCompleted >= 20,
    },
    {
      id:       'defi_hard',
      emoji:    '💪',
      title:    'Coeur de lion',
      desc:     'Complète ton premier défi Difficile.',
      category: 'defis',
      secret:   false,
      check:    (stats) => stats.hardCompleted >= 1,
    },
    {
      id:       'defis_hard_5',
      emoji:    '🦁',
      title:    'Intrépide',
      desc:     'Complète 5 défis Difficiles.',
      category: 'defis',
      secret:   false,
      check:    (stats) => stats.hardCompleted >= 5,
    },

    /* ── Journal ── */
    {
      id:       'journal_1',
      emoji:    '📓',
      title:    'Première page',
      desc:     'Écris ta première entrée de journal.',
      category: 'journal',
      secret:   false,
      check:    (stats) => stats.journalEntries >= 1,
    },
    {
      id:       'journal_10',
      emoji:    '📚',
      title:    'Écrivain du social',
      desc:     'Écris 10 entrées dans ton journal.',
      category: 'journal',
      secret:   false,
      check:    (stats) => stats.journalEntries >= 10,
    },

    /* ── Secrets ── */
    {
      id:       'code_robin',
      emoji:    '🎩',
      title:    'Le code secret',
      desc:     'Tu as trouvé le code de Robin.',
      category: 'secret',
      secret:   true,
      check:    (stats) => stats.usedCode === true,
    },
    {
      id:       'nuit',
      emoji:    '🌙',
      title:    'Noctambule',
      desc:     'Complète un défi entre minuit et 5h du matin.',
      category: 'secret',
      secret:   true,
      check:    (stats) => stats.nightOwl === true,
    },
    {
      id:       'speedrun',
      emoji:    '⚡',
      title:    'Speedrunner',
      desc:     'Complète 3 défis en moins d\'une heure.',
      category: 'secret',
      secret:   true,
      check:    (stats) => stats.speedrun === true,
    },
  ];

  /* ---- Calculer les stats pour vérifier les badges ---- */
  async function computeStats() {
    const profile  = await DB.getProfile();
    const journal  = await DB.getJournal();
    const levelInfo = Data.getLevelInfo(profile?.xp || 0);

    // Compter les défis complétés
    let totalCompleted = 0;
    let hardCompleted  = 0;
    for (const defi of Data.DEFIS_CATALOGUE) {
      const count = await DB.getCompletedCount(defi.id);
      totalCompleted += count;
      if (defi.difficulty === 'hard') hardCompleted += count;
    }

    const hour = new Date().getHours();

    return {
      xp:              profile?.xp      || 0,
      streak:          profile?.streak  || 0,
      level:           levelInfo.current.level,
      totalCompleted,
      hardCompleted,
      journalEntries:  journal.length,
      usedCode:        await DB.isPremium(),
      nightOwl:        hour >= 0 && hour < 5,
      speedrun:        false, // géré dynamiquement
    };
  }

  /* ---- Vérifier et débloquer les badges gagnés ---- */
  async function checkAndUnlock() {
    const stats    = await computeStats();
    const unlocked = await DB.getBadges();
    const newOnes  = [];

    for (const badge of CATALOGUE) {
      if (unlocked.includes(badge.id)) continue;
      if (badge.check(stats)) {
        const ok = await DB.unlockBadge(badge.id);
        if (ok) newOnes.push(badge);
      }
    }

    return newOnes; // badges nouvellement débloqués
  }

  /* ---- Rendu de l'écran badges (dans le profil) ---- */
  async function render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const unlocked = await DB.getBadges();

    // Grouper par catégorie
    const categories = {
      debut:   { label: '🌱 Premiers pas',   items: [] },
      streak:  { label: '🔥 Séries',         items: [] },
      xp:      { label: '⭐ XP & Points',    items: [] },
      niveau:  { label: '🚀 Niveaux',        items: [] },
      defis:   { label: '🎯 Défis',          items: [] },
      journal: { label: '📓 Journal',        items: [] },
      secret:  { label: '🎩 Secrets',        items: [] },
    };

    for (const badge of CATALOGUE) {
      const cat = categories[badge.category];
      if (cat) cat.items.push(badge);
    }

    container.innerHTML = Object.values(categories).map(cat => `
      <div class="badge-category">
        <div class="badge-cat-title">${cat.label}</div>
        <div class="badge-grid">
          ${cat.items.map(badge => {
            const isUnlocked = unlocked.includes(badge.id);
            const isSecret   = badge.secret && !isUnlocked;
            return `
              <div class="badge-item ${isUnlocked ? 'unlocked' : 'locked'}" title="${isSecret ? '???' : badge.title}">
                <div class="badge-emoji">${isSecret ? '❓' : badge.emoji}</div>
                <div class="badge-name">${isSecret ? '???' : badge.title}</div>
                ${isUnlocked ? '<div class="badge-check">✓</div>' : ''}
              </div>`;
          }).join('')}
        </div>
      </div>`).join('');
  }

  return {
    CATALOGUE,
    computeStats,
    checkAndUnlock,
    render,
  };

})();
