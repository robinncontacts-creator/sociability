/* ================================================
   data.js — Données, localStorage, XP, Niveaux
   Sociability App
   ================================================ */

const Data = (() => {

  /* ---- Clés localStorage ---- */
  const KEYS = {
    USER:        'soc_user',
    COMPLETED:   'soc_completed',
    JOURNAL:     'soc_journal',
    MOOD_TODAY:  'soc_mood_today',
    LAST_ACTIVE: 'soc_last_active',
    UNLOCKED:    'soc_unlocked',    // true si accès premium débloqué
  };

  /* ---- Système de niveaux ---- */
  const LEVELS = [
    { level: 1,  name: 'Timide',        minXP: 0    },
    { level: 2,  name: 'Curieux',       minXP: 100  },
    { level: 3,  name: 'Ouvert',        minXP: 250  },
    { level: 4,  name: 'Sociable',      minXP: 500  },
    { level: 5,  name: 'Connecté',      minXP: 900  },
    { level: 6,  name: 'Influent',      minXP: 1400 },
    { level: 7,  name: 'Charismatique', minXP: 2100 },
    { level: 8,  name: 'Leader',        minXP: 3000 },
    { level: 9,  name: 'Inspirant',     minXP: 4200 },
    { level: 10, name: 'Légendaire',    minXP: 6000 },
  ];

  /* ---- Catalogue des défis avec niveaux requis ---- */
  const DEFIS_CATALOGUE = [

    /* ══════════════ NIVEAU 1 — Les premiers pas ══════════════ */
    {
      id: 'bonjour_inconnu',
      emoji: '👋',
      title: 'Dire bonjour à un inconnu',
      desc: 'Salue une personne que tu ne connais pas dans la rue, à la caisse ou dans l\'ascenseur. Un simple sourire compte aussi !',
      category: 'social',
      difficulty: 'easy',
      xp: 20,
      minLevel: 1,
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
      minLevel: 1,
      isDaily: true,
      maxCount: 10,
    },
    {
      id: 'remercier',
      emoji: '🙏',
      title: 'Remercier quelqu\'un',
      desc: 'Exprime ta gratitude à quelqu\'un qui t\'a aidé — même pour quelque chose de tout petit.',
      category: 'social',
      difficulty: 'easy',
      xp: 20,
      minLevel: 1,
      isDaily: false,
      maxCount: 15,
    },
    {
      id: 'demander_aide',
      emoji: '🙋',
      title: 'Demander de l\'aide',
      desc: 'Demande ton chemin ou de l\'aide à un(e) inconnu(e) aujourd\'hui. Pas besoin d\'une longue conversation !',
      category: 'courage',
      difficulty: 'easy',
      xp: 25,
      minLevel: 1,
      isDaily: false,
      maxCount: 10,
    },

    /* ══════════════ NIVEAU 2 — On s'échauffe ══════════════ */
    {
      id: 'petit_talk',
      emoji: '💬',
      title: 'Le petit talk',
      desc: 'Engage une conversation de 2 minutes avec quelqu\'un dans un lieu public. Météo, file d\'attente, transport… tout est prétexte !',
      category: 'social',
      difficulty: 'easy',
      xp: 30,
      minLevel: 2,
      isDaily: false,
      maxCount: 10,
    },
    {
      id: 'partager_opinion',
      emoji: '💡',
      title: 'Partager une opinion',
      desc: 'Donne ton avis sur un sujet lors d\'une discussion, même si tu n\'es pas sûr(e) de toi. Les autres ont envie de t\'entendre !',
      category: 'courage',
      difficulty: 'easy',
      xp: 30,
      minLevel: 2,
      isDaily: true,
      maxCount: 10,
    },
    {
      id: 'selfie_inconnu',
      emoji: '📸',
      title: 'Le selfie audacieux',
      desc: 'Demande à un(e) inconnu(e) de prendre une photo de toi (pas un selfie, une vraie photo !). Engage la conversation après.',
      category: 'courage',
      difficulty: 'easy',
      xp: 35,
      minLevel: 2,
      isDaily: false,
      maxCount: 8,
    },

    /* ══════════════ NIVEAU 3 — Les choses sérieuses ══════════════ */
    {
      id: 'rejoindre_conv',
      emoji: '🗣️',
      title: 'Rejoindre une conversation',
      desc: 'Entre naturellement dans une discussion de groupe et contribue avec au moins une idée. Tu as le droit de trembler un peu !',
      category: 'groupe',
      difficulty: 'medium',
      xp: 50,
      minLevel: 3,
      isDaily: false,
      maxCount: 5,
    },
    {
      id: 'table_ouverte',
      emoji: '🍽️',
      title: 'Table ouverte',
      desc: 'Propose à quelqu\'un de manger avec toi ou rejoins une table déjà occupée. L\'alibi parfait pour socialiser.',
      category: 'groupe',
      difficulty: 'medium',
      xp: 45,
      minLevel: 3,
      isDaily: false,
      maxCount: 5,
    },
    {
      id: 'appel_spontane',
      emoji: '📞',
      title: 'Appel spontané',
      desc: 'Appelle quelqu\'un que tu n\'as pas contacté depuis longtemps. Juste pour prendre des nouvelles. Sans texto préalable.',
      category: 'courage',
      difficulty: 'medium',
      xp: 40,
      minLevel: 3,
      isDaily: false,
      maxCount: 8,
    },

    /* ══════════════ NIVEAU 4 — On monte d'un cran ══════════════ */
    {
      id: 'invitation',
      emoji: '📨',
      title: 'Lancer une invitation',
      desc: 'Propose une activité à quelqu\'un — un café, une balade, un film. Peu importe si c\'est accepté, l\'important c\'est d\'oser !',
      category: 'courage',
      difficulty: 'medium',
      xp: 55,
      minLevel: 4,
      isDaily: false,
      maxCount: 5,
    },
    {
      id: 'blague_caissiere',
      emoji: '😄',
      title: 'Faire rire la caissière',
      desc: 'Essaie de faire sourire ou rire la personne à la caisse avec une remarque sympathique. Mission accomplie si tu obtiens un vrai sourire !',
      category: 'social',
      difficulty: 'medium',
      xp: 50,
      minLevel: 4,
      isDaily: false,
      maxCount: 8,
    },
    {
      id: 'numero_telephone',
      emoji: '📱',
      title: 'Demander un numéro',
      desc: 'Demande le numéro ou l\'Instagram de quelqu\'un que tu trouves sympa (ami potentiel, pas forcément romantique). Le refus fait aussi grandir !',
      category: 'courage',
      difficulty: 'medium',
      xp: 60,
      minLevel: 4,
      isDaily: false,
      maxCount: 5,
    },

    /* ══════════════ NIVEAU 5 — Les défis qui font peur ══════════════ */
    {
      id: 'prise_de_parole',
      emoji: '🎤',
      title: 'Prise de parole',
      desc: 'Prends la parole dans une réunion ou un groupe d\'au moins 5 personnes. Une seule phrase, ça compte !',
      category: 'groupe',
      difficulty: 'hard',
      xp: 80,
      minLevel: 5,
      isDaily: false,
      maxCount: 5,
    },
    {
      id: 'compliment_etrange',
      emoji: '🌈',
      title: 'Le compliment bizarre',
      desc: 'Fais un compliment totalement inattendu à un inconnu ("Vos chaussures ont l\'air vraiment confortables"). Observe sa réaction.',
      category: 'social',
      difficulty: 'medium',
      xp: 55,
      minLevel: 5,
      isDaily: false,
      maxCount: 6,
    },
    {
      id: 'soiree_inconnue',
      emoji: '🎉',
      title: 'Soirée inconnue',
      desc: 'Va seul(e) à un événement où tu ne connais personne et engage au moins une conversation de 5 minutes.',
      category: 'courage',
      difficulty: 'hard',
      xp: 120,
      minLevel: 5,
      isDaily: false,
      maxCount: 3,
    },

    /* ══════════════ NIVEAU 6 — Mode avancé ══════════════ */
    {
      id: 'debat_opinion',
      emoji: '⚡',
      title: 'Défendre une opinion',
      desc: 'Exprime une opinion avec laquelle tu sais que quelqu\'un n\'est pas d\'accord, et tiens ta position avec bienveillance.',
      category: 'courage',
      difficulty: 'hard',
      xp: 90,
      minLevel: 6,
      isDaily: false,
      maxCount: 5,
    },
    {
      id: 'discours_bus',
      emoji: '🚌',
      title: 'Le discours dans le bus',
      desc: 'Dans les transports en commun, dis à voix haute (mais normalement) : "Est-ce que quelqu\'un a une recommandation de film ?". Attends les réactions.',
      category: 'groupe',
      difficulty: 'hard',
      xp: 100,
      minLevel: 6,
      isDaily: false,
      maxCount: 3,
    },

    /* ══════════════ NIVEAU 7 — Les légendes urbaines ══════════════ */
    {
      id: 'chanter_public',
      emoji: '🎶',
      title: 'Chanter en public',
      desc: 'Fredonne ou chante doucement une chanson dans un espace public (pas trop fort, juste assez pour que quelqu\'un t\'entende). Au moins 30 secondes.',
      category: 'courage',
      difficulty: 'hard',
      xp: 130,
      minLevel: 7,
      isDaily: false,
      maxCount: 3,
    },
    {
      id: 'animation_parc',
      emoji: '🎪',
      title: 'L\'animateur de parc',
      desc: 'Va dans un parc et propose spontanément un jeu ou une activité à des inconnus (frisbee, cartes, etc.). Tente d\'en convaincre au moins un.',
      category: 'groupe',
      difficulty: 'hard',
      xp: 150,
      minLevel: 7,
      isDaily: false,
      maxCount: 2,
    },

    /* ══════════════ NIVEAU 8 — Mode légende ══════════════ */
    {
      id: 'ted_talk_impro',
      emoji: '🏟️',
      title: 'Mini TED Talk improvisé',
      desc: 'Parle pendant 2 minutes à un groupe d\'au moins 3 personnes d\'un sujet qui te passionne. Préviens-les à l\'avance que tu vas "faire un exposé".',
      category: 'groupe',
      difficulty: 'hard',
      xp: 200,
      minLevel: 8,
      isDaily: false,
      maxCount: 2,
    },
    {
      id: 'mime_metro',
      emoji: '🎭',
      title: 'Le mime dans le métro',
      desc: 'Mime une action pendant 1 minute dans les transports et vois si quelqu\'un réagit. (Reste bienveillant et fun, pas dérangeant !)',
      category: 'courage',
      difficulty: 'hard',
      xp: 180,
      minLevel: 8,
      isDaily: false,
      maxCount: 2,
    },

    /* ══════════════ NIVEAU 9-10 — Hall of Fame ══════════════ */
    {
      id: 'stand_up',
      emoji: '🦁',
      title: 'Stand-up d\'une minute',
      desc: 'Raconte une anecdote drôle ou une blague à un groupe d\'au moins 5 personnes. Micro (imaginaire) en main, tu assures !',
      category: 'groupe',
      difficulty: 'hard',
      xp: 250,
      minLevel: 9,
      isDaily: false,
      maxCount: 2,
    },
    {
      id: 'organiser_event',
      emoji: '👑',
      title: 'Organiser un événement',
      desc: 'Organise une sortie, un repas ou une activité pour au moins 5 personnes que tu connais peu. Tu es le/la catalyseur(se) social(e) !',
      category: 'groupe',
      difficulty: 'hard',
      xp: 300,
      minLevel: 10,
      isDaily: false,
      maxCount: 1,
    },
  ];

  /* ---- Faux leaderboard (simulé) ---- */
  const FAKE_LEADERBOARD = [
    { initials: 'EM', name: 'Emma',    xp: 2840 },
    { initials: 'SA', name: 'Sacha',   xp: 2310 },
    { initials: 'JU', name: 'Jules',   xp: 1980 },
    { initials: 'MO', name: 'Morgane', xp: 1650 },
    { initials: 'TH', name: 'Théo',    xp: 1240 },
    { initials: 'AL', name: 'Alice',   xp: 980  },
    { initials: 'NO', name: 'Noah',    xp: 820  },
    { initials: 'CH', name: 'Charlie', xp: 610  },
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
    let next    = LEVELS[1];
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (xp >= LEVELS[i].minXP) {
        current = LEVELS[i];
        next    = LEVELS[i + 1] || null;
        break;
      }
    }
    const xpInLevel = next ? xp - current.minXP : 0;
    const xpNeeded  = next ? next.minXP - current.minXP : 1;
    const pct       = next ? Math.round((xpInLevel / xpNeeded) * 100) : 100;
    return { current, next, xpInLevel, xpNeeded, pct };
  }

  /* ---- Accès premium ---- */
  const PROMO_CODE    = 'robin';
  const PREMIUM_PRICE = '4,99 €';

  function isPremium() {
    return load(KEYS.UNLOCKED, false) === true;
  }

  function unlockPremium() {
    save(KEYS.UNLOCKED, true);
  }

  function checkCode(code) {
    return code.trim().toLowerCase() === PROMO_CODE;
  }

  /* ---- Vérifier si un défi est accessible ---- */
  function isDefiAccessible(defi) {
    if (isPremium()) return true;
    const user      = getUser();
    const levelInfo = getLevelInfo(user.xp);
    return levelInfo.current.level >= defi.minLevel;
  }

  /* ---- Streak ---- */
  function updateStreak() {
    const today      = todayStr();
    const lastActive = load(KEYS.LAST_ACTIVE, null);
    const user       = getUser();

    if (lastActive === today) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = dateToStr(yesterday);

    if (lastActive === yStr) {
      user.streak = (user.streak || 0) + 1;
    } else {
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
    return getCompleted()[id] === todayStr();
  }

  function getCompletedCount(id) {
    return load(id + '_count', 0);
  }

  function markCompleted(id) {
    const completed  = getCompleted();
    completed[id]    = todayStr();
    save(KEYS.COMPLETED, completed);
    save(id + '_count', getCompletedCount(id) + 1);
  }

  /* ---- Défis quotidiens (uniquement accessibles) ---- */
  function getDailyDefis() {
    return DEFIS_CATALOGUE.filter(d => d.isDaily && isDefiAccessible(d));
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
    all.push({ initials: getUserInitials(), name: getUser().name, xp: userXP, isMe: true });
    all.sort((a, b) => b.xp - a.xp);
    return all;
  }

  function getUserInitials() {
    const name = getUser().name || 'R';
    return name.slice(0, 2).toUpperCase();
  }

  /* ---- Utilitaires date ---- */
  function todayStr() { return dateToStr(new Date()); }

  function dateToStr(date) { return date.toISOString().split('T')[0]; }

  function formatRelativeDate(isoString) {
    const date = new Date(isoString);
    const diff = Math.floor((new Date() - date) / 1000);
    if (diff < 60)     return 'À l\'instant';
    if (diff < 3600)   return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400)  return `Il y a ${Math.floor(diff / 3600)} h`;
    if (diff < 172800) return 'Hier';
    if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)} jours`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  }

  /* ---- API publique ---- */
  return {
    DEFIS_CATALOGUE,
    LEVELS,
    FAKE_LEADERBOARD,
    PREMIUM_PRICE,
    getUser,
    saveUser,
    addXP,
    getLevelInfo,
    isPremium,
    unlockPremium,
    checkCode,
    isDefiAccessible,
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
