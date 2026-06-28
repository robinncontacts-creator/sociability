/* ================================================
   notifications.js — Rappels streak (Web Push)
   Sociability App

   Utilise l'API Notifications du navigateur.
   Pas besoin de backend — notifications locales.
   ================================================ */

const Notifs = (() => {

  const STORAGE_KEY = 'soc_notifs_enabled';

  /* ---- Vérifier le support ---- */
  function isSupported() {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  function isEnabled() {
    return localStorage.getItem(STORAGE_KEY) === 'true'
      && Notification.permission === 'granted';
  }

  /* ---- Demander la permission ---- */
  async function requestPermission() {
    if (!isSupported()) {
      App.toast('Ton navigateur ne supporte pas les notifications.');
      return false;
    }

    if (Notification.permission === 'granted') {
      localStorage.setItem(STORAGE_KEY, 'true');
      scheduleStreak();
      return true;
    }

    if (Notification.permission === 'denied') {
      App.toast('Notifications bloquées. Autorise-les dans les paramètres du navigateur.');
      return false;
    }

    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      localStorage.setItem(STORAGE_KEY, 'true');
      scheduleStreak();
      App.toast('🔔 Notifications activées ! On te rappellera chaque jour.');
      return true;
    }

    return false;
  }

  /* ---- Désactiver ---- */
  function disable() {
    localStorage.setItem(STORAGE_KEY, 'false');
    App.toast('🔕 Notifications désactivées.');
  }

  /* ---- Planifier le rappel streak (20h chaque soir) ---- */
  function scheduleStreak() {
    if (!isEnabled()) return;

    const now    = new Date();
    const target = new Date();
    target.setHours(20, 0, 0, 0);

    // Si 20h est déjà passé aujourd'hui, planifier pour demain
    if (now >= target) target.setDate(target.getDate() + 1);

    const delay = target - now;

    setTimeout(() => {
      sendStreakReminder();
      // Re-planifier pour le lendemain
      setInterval(sendStreakReminder, 24 * 60 * 60 * 1000);
    }, delay);

    console.log(`Notif streak planifiée dans ${Math.round(delay / 60000)} minutes`);
  }

  /* ---- Envoyer la notification streak ---- */
  function sendStreakReminder() {
    if (!isEnabled()) return;

    const profile = Data.getUser();
    const streak  = profile.streak || 0;

    let title, body, icon;

    if (streak === 0) {
      title = '👋 Sociability t\'attend !';
      body  = 'Lance-toi dans un défi aujourd\'hui pour commencer ta série.';
    } else if (streak < 3) {
      title = `🔥 Série de ${streak} jour${streak > 1 ? 's' : ''} !`;
      body  = 'Continue sur ta lancée et relève un défi aujourd\'hui.';
    } else if (streak < 7) {
      title = `🔥🔥 ${streak} jours de suite !`;
      body  = 'Tu es en feu ! Garde ta série vivante ce soir.';
    } else {
      title = `💎 ${streak} jours — Tu déchires !`;
      body  = 'Une vraie légende sociale. Ne brise pas ta série !';
    }

    try {
      new Notification(title, {
        body,
        icon:  'assets/favicon.svg',
        badge: 'assets/favicon.svg',
        tag:   'streak-reminder',   // Remplace la notif précédente
        renotify: true,
      });
    } catch (err) {
      console.error('Notif error:', err);
    }
  }

  /* ---- Notification de bienvenue (test) ---- */
  function sendWelcome(name) {
    if (!isEnabled()) return;
    setTimeout(() => {
      try {
        new Notification(`Bienvenue, ${name} ! 🎉`, {
          body: 'Ton aventure sociale commence maintenant. Premier défi : dire bonjour à un inconnu !',
          icon: 'assets/favicon.svg',
          tag:  'welcome',
        });
      } catch {}
    }, 3000);
  }

  /* ---- Notification badge débloqué ---- */
  function sendBadgeUnlocked(badge) {
    if (!isEnabled()) return;
    try {
      new Notification(`Badge débloqué ! ${badge.emoji}`, {
        body: `"${badge.title}" — ${badge.desc}`,
        icon: 'assets/favicon.svg',
        tag:  'badge-' + badge.id,
      });
    } catch {}
  }

  /* ---- Init au démarrage ---- */
  function init() {
    if (isEnabled()) scheduleStreak();
  }

  return {
    isSupported,
    isEnabled,
    requestPermission,
    disable,
    scheduleStreak,
    sendStreakReminder,
    sendWelcome,
    sendBadgeUnlocked,
    init,
  };

})();
