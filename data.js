/* ================================================
   data.js — Données, localStorage, XP, Niveaux
   Sociability App
   ================================================ */

const Data = (() => {

  /* ---- Clés localStorage ---- */
  const KEYS = {
    USER:        'soc_user',
    COMPLETED:   'soc_completed',   // { "defi_id": "2024-06-28", ... }
    JOURNAL:     'soc_journal',     // [{ id, date, mood, text }, ...]
    MOOD_TODAY:  'soc_mood_today',  // { date, emoji }
    LAST_ACTIVE: 'soc_last_active', // "2024-06-28"
  };

  /* ---- Système de niveaux ---- */
  const LEVELS = [
    { level: 1,  name: 'Timide',       minXP: 0   },
    { level: 2,  name: 'Curieux',      minXP: 100 },
    { level: 3,  name: 'Ouvert',       minXP: 250 },
    { level: 4,  name: 'Sociable',     minXP: 500 },
    { level: 5,  name: 'Connecté',     minXP: 900 },
    { level: 6,  name: 'Influent',     minXP: 1400},
    { level: 7,  name: 'Charismatique',minXP: 2100},
    { level: 8,  name: 'Leader',       minXP: 3000},
    { level: 9,  name: 'Inspirant',    minXP: 4200},
    { level: 10, name: 'Légendaire',   minXP: 6000},
  ];

  /* ---- Catalogue des défis ---- */
  const DEFIS_CATALOGUE = [
    {
      id: 'bonjour_inconnu',
      emoji: '👋',
      title: 'Dire bonjour à un inconnu',
      desc: 'Salue une personne que tu ne connais pas dans la rue, à la caisse ou dans l\'ascenseur.',
      category: 'social',
      difficulty: 'easy',
      xp: 20,
      isDaily: true,
      maxCount: 10,
    },
    {
      id: 'compliment',
      emoji: '💛',
      title: 'Faire un compliment sincère',
      desc: 'Dis quelque chose de positif et sincère à quelqu\'un aujourd\'hui. Note comment tu te sens après.',
      category: 'social',
      difficulty: 'easy',
      xp: 30,
      isDaily: true,
      maxCount: 10,
    },
    {
      id: 'rejoindre_conv',
      emoji: '🗣️',
      title: 'Rejoindre une conversation',
      desc: 'Entre naturellement dans une discussion de groupe et contribue avec au moins une idée.',
      category: 'groupe',
      difficulty: 'medium',
      xp: 50,
      isDaily: false,
      maxCount: 5,
    },
    {
      id: 'petit_talk',
      emoji: '💬',
      title: 'Le petit talk',
      desc: 'Engage une conversation de 2 minutes avec quelqu\'un dans un lieu public (boulangerie, bus, salle d\'attente).',
      category: 'social',
      difficulty: 'easy',
      xp: 30,
      isDaily: false,
      maxCount: 10,
    },
    {
      id: 'demander_aide',
      emoji: '🙋',
      title: 'Demander de l\'aide',
      desc: 'Demande ton chemin ou de l\'aide à un(e) inconnu(e) aujourd\'hui. Pas besoin d\'une longue conversation !',
      category: 'courage',
      difficulty: 'easy',
      xp: 25,
      isDaily: false,
      maxCount: 10,
    },
    {
      id: 'table_ouverte',
      emoji: '🍽️',
      title: 'Table ouverte',
      desc: 'Propose à quelqu\'un de manger avec toi ou rejoins une table déjà occupée.',
      category: 'groupe',
      difficulty: 'medium',
      xp: 45,
      isDaily: false,
      maxCount: 5,
    },
    {
      id: 'appel_spontane',
      emoji: '📞',
      title: 'Appel spontané',
      desc: 'Appelle quelqu\'un que tu n\'as pas contacté depuis longtemps. Juste pour prendre des nouvelles.',
      category: 'courage',
      difficulty: 'medium',
      xp: 40,
      isDaily: false,
      maxCount: 8,
    },
    {
      id: 'prise_de_parole',
      emoji: '🎤',
      title: 'Prise de parole',
      desc: 'Prends la parole dans une réunion ou un groupe d\'au moins 5 personnes. Une seule phrase, ça compte !',
      category: 'groupe',
      difficulty: 'hard',
      xp: 80,
      isDaily: false,
      maxCount: 5,
    },
    {
      id: 'soiree_inconnue',
      emoji: '🎉',
      title: 'Soirée inconnue',
      desc: 'Va seul(e) à un événement où tu ne connais personne et engage au moins une conversation.',
      category: 'courage',
      difficulty: 'hard',
      xp: 120,
      isDaily: false,
      maxCount: 3,
    },
    {
      id: 'remercier',
      emoji: '🙏',
      title: 'Remercier quelqu\'un',
      desc: 'Exprime ta gratitude à quelqu\'un qui t\'a aidé — même pour quelque chose de petit.',
      category: 'social',
      difficulty: 'easy',
      xp: 20,
      isDaily: false,
      maxCount: 15,
    },
    {
      id: 'invitation',
      emoji: '📨',
      title: 'Lancer une invitation',
      desc: 'Propose une activité à quelqu\'un — un café, une balade, un film. Peu importe si c\'est accepté !',
      category: 'courage',
      difficulty: 'medium',
      xp: 55,
      isDaily: false,
      maxCount: 5,
    },
    {
      id: 'partager_opinion',
      emoji: '💡',
      title: 'Partager une opinion',
      desc: 'Donne ton avis sur un sujet lors d\'une discussion, même si tu n\'es pas sûr(e) de toi.',
      category: 'courage',
      difficulty: 'easy',
      xp: 30,
      isDaily: true,
      maxCount: 10,
    },
  ];

  /* ---- Faux leaderboard (simulé) ---- */
  const FAKE_LEADERBOARD = [
    { initials: 'EM', name: 'Emma',    xp: 2840, color: '#7C3AED', bg: 'rgba(124,58,237,0.15)' },
    { initials: 'SA', name: 'Sacha',   xp: 2310, color: '#22D3EE', bg: 'rgba(34,211,238,0.12)' },
    { initials: 'JU', name: 'Jules',   xp: 1980, color: '#34D399', bg: 'rgba(52,211,153,0.12)' },
    { initials: 'MO', name: 'Morgane', xp: 1650, color: '#FBBF24', bg: 'rgba(251,191,36,0.12)' },
    { initials: 'TH', name: 'Théo',    xp: 1240, color: '#F87171', bg: 'rgba(248,113,113,0.12)' },
    { initials: 'AL', name: 'Alice',   xp: 980,  color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
    { initials: 'NO', name: 'Noah',    xp: 820,  color: '#22D3EE', bg: 'rgba(34,211,238,0.10)' },
    { initials: 'CH', name: 'Charlie', xp: 610,  color: '#34D399', bg: 'rgba(52,211,153,0.10)' },
  ];

  /* ---- Helpers localStorage ---- */
  function load(key, fallback = null) {
    try {
      const val = localStorage.getItem(key);
      return val !== null ? JSON.parse(val) : fallback;
    } catch { return fallback; }
  }

  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }

  /* ---- Données utilisateur ---- */
  function getUser() {
    return load(KEYS.USER, { name: 'Robin', xp: 0, streak: 0 });
  }

  function saveUser(user) {
    save(KEYS.USER, user);
  }

  /* ---- XP ---- */
  function addXP(amount) {
    const user = getUser();
    user.xp += amount;
    saveUser(user);
    updateStreak();
    return user.xp;
  }

  /* ---- Calcul niveau ---- */
  function getLevelInfo(xp) {
    let current = LEVELS[0];
    let next = LEVELS[1];
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (xp >= LEVELS[i].minXP) {
        current = LEVELS[i];
        next = LEVELS[i + 1] || null;
        break;
      }
    }
    const xpInLevel  = next ? xp - current.minXP : 0;
    const xpNeeded   = next ? next.minXP - current.minXP : 1;
    const pct        = next ? Math.round((xpInLevel / xpNeeded) * 100) : 100;
    return { current, next, xpInLevel, xpNeeded, pct };
  }

  /* ---- Streak ---- */
  function updateStreak() {
    const today       = todayStr();
    const lastActive  = load(KEYS.LAST_ACTIVE, null);
    const user        = getUser();

    if (lastActive === today) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = dateToStr(yesterday);

    if (lastActive === yStr) {
      user.streak = (user.streak || 0) + 1;
    } else if (lastActive !== today) {
      user.streak = 1;
    }

    saveUser(user);
    save(KEYS.LAST_ACTIVE, today);
  }

  /* ---- Défis complétés ---- */
  function getCompleted() {
    return load(KEYS.COMPLETED, {});
  }

  function isCompletedToday(id) {
    const completed = getCompleted();
    return completed[id] === todayStr();
  }

  function getCompletedCount(id) {
    const completed = getCompleted();
    // Compte combien de fois ce défi a été fait au total
    const key = id + '_count';
    return load(key, 0);
  }

  function markCompleted(id) {
    const completed = getCompleted();
    completed[id] = todayStr();
    save(KEYS.COMPLETED, completed);
    // Incrémenter le compteur total
    const key = id + '_count';
    const count = load(key, 0);
    save(key, count + 1);
  }

  /* ---- Défis quotidiens ---- */
  function getDailyDefis() {
    return DEFIS_CATALOGUE.filter(d => d.isDaily);
  }

  /* ---- Journal ---- */
  function getJournal() {
    return load(KEYS.JOURNAL, []);
  }

  function addJournalEntry(entry) {
    const journal = getJournal();
    journal.unshift(entry);
    save(KEYS.JOURNAL, journal);
  }

  /* ---- Humeur du jour ---- */
  function getMoodToday() {
    const data = load(KEYS.MOOD_TODAY, null);
    if (!data || data.date !== todayStr()) return '🙂';
    return data.emoji;
  }

  function saveMoodToday(emoji) {
    save(KEYS.MOOD_TODAY, { date: todayStr(), emoji });
  }

  /* ---- Leaderboard ---- */
  function getLeaderboard(userXP) {
    const all = [...FAKE_LEADERBOARD];
    // Insérer le joueur dans la liste
    const me = { initials: getUserInitials(), name: getUser().name, xp: userXP, isMe: true };
    all.push(me);
    all.sort((a, b) => b.xp - a.xp);
    return all;
  }

  function getUserInitials() {
    const name = getUser().name || 'R';
    return name.slice(0, 2).toUpperCase();
  }

  /* ---- Utilitaires date ---- */
  function todayStr() {
    return dateToStr(new Date());
  }

  function dateToStr(date) {
    return date.toISOString().split('T')[0];
  }

  function formatRelativeDate(isoString) {
    const date = new Date(isoString);
    const now  = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60)          return 'À l\'instant';
    if (diff < 3600)        return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400)       return `Il y a ${Math.floor(diff / 3600)} h`;
    if (diff < 172800)      return 'Hier';
    if (diff < 604800)      return `Il y a ${Math.floor(diff / 86400)} jours`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  }

  /* ---- API publique ---- */
  return {
    DEFIS_CATALOGUE,
    LEVELS,
    FAKE_LEADERBOARD,
    getUser,
    saveUser,
    addXP,
    getLevelInfo,
    updateStreak,
    getCompleted,
    isCompletedToday,
    getCompletedCount,
    markCompleted,
    getDailyDefis,
    getJournal,
    addJournalEntry,
    getMoodToday,
    saveMoodToday,
    getLeaderboard,
    getUserInitials,
    todayStr,
    formatRelativeDate,
  };

})();