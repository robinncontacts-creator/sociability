/* ================================================
   db.js — Base de données Firestore
   Sociability App

   Structure Firestore :
   ┌─ users/{uid}
   │    ├─ name          string
   │    ├─ xp            number
   │    ├─ streak        number
   │    ├─ lastActive    string (YYYY-MM-DD)
   │    ├─ premium       boolean
   │    ├─ badges        string[]
   │    ├─ createdAt     timestamp
   │    └─ updatedAt     timestamp
   │
   ├─ users/{uid}/journal/{entryId}
   │    ├─ text    string
   │    ├─ mood    string
   │    ├─ defi    string|null
   │    └─ date    timestamp
   │
   ├─ users/{uid}/completed/{defiId}
   │    ├─ lastDate  string (YYYY-MM-DD)
   │    └─ count     number
   │
   └─ leaderboard/{uid}
        ├─ name    string
        ├─ xp      number
        └─ updatedAt timestamp
   ================================================ */

const DB = (() => {

  /* ---- Helpers Firestore ---- */
  const { db, doc, getDoc, setDoc, updateDoc,
          collection, getDocs, query, orderBy, limit,
          serverTimestamp } = FirebaseApp;

  /* ---- Fallback localStorage si Firebase non configuré ---- */
  function isConfigured() {
    const cfg = typeof FIREBASE_CONFIG !== 'undefined';
    return cfg && FIREBASE_CONFIG.apiKey !== "REMPLACE_PAR_TA_API_KEY";
  }

  /* ========================================
     PROFIL UTILISATEUR
  ======================================== */

  async function getProfile() {
    if (!isConfigured()) return Data.getUser();
    const uid = Auth.getUID();
    if (!uid) return null;

    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        return snap.data();
      }
      // Profil inexistant → créer un profil par défaut
      const defaults = {
        name:       '',
        xp:         0,
        streak:     0,
        lastActive: '',
        premium:    false,
        badges:     [],
        createdAt:  serverTimestamp(),
        updatedAt:  serverTimestamp(),
      };
      await setDoc(doc(db, 'users', uid), defaults);
      return defaults;
    } catch (err) {
      console.error('DB.getProfile:', err);
      return Data.getUser(); // fallback
    }
  }

  async function saveProfile(data) {
    if (!isConfigured()) { Data.saveUser(data); return; }
    const uid = Auth.getUID();
    if (!uid) return;

    try {
      await updateDoc(doc(db, 'users', uid), {
        ...data,
        updatedAt: serverTimestamp(),
      });
      // Sync leaderboard si XP changé
      if (data.xp !== undefined) {
        await setDoc(doc(db, 'leaderboard', uid), {
          name:      data.name || '',
          xp:        data.xp,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.error('DB.saveProfile:', err);
      Data.saveUser(data); // fallback
    }
  }

  async function updateField(field, value) {
    const profile = await getProfile();
    if (!profile) return;
    profile[field] = value;
    await saveProfile(profile);
  }

  /* ========================================
     XP & NIVEAUX
  ======================================== */

  async function addXP(amount) {
    const profile = await getProfile();
    if (!profile) return 0;
    profile.xp = (profile.xp || 0) + amount;
    await saveProfile({ xp: profile.xp, name: profile.name });
    await updateStreak(profile);
    return profile.xp;
  }

  /* ========================================
     STREAK
  ======================================== */

  async function updateStreak(profile) {
    if (!profile) profile = await getProfile();
    if (!profile) return;

    const today = todayStr();
    if (profile.lastActive === today) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = dateToStr(yesterday);

    const newStreak = profile.lastActive === yStr
      ? (profile.streak || 0) + 1
      : 1;

    await saveProfile({
      name:       profile.name,
      xp:         profile.xp,
      streak:     newStreak,
      lastActive: today,
    });

    return newStreak;
  }

  /* ========================================
     DÉFIS COMPLÉTÉS
  ======================================== */

  async function isCompletedToday(defiId) {
    if (!isConfigured()) return Data.isCompletedToday(defiId);
    const uid = Auth.getUID();
    if (!uid) return false;

    try {
      const snap = await getDoc(doc(db, 'users', uid, 'completed', defiId));
      if (!snap.exists()) return false;
      return snap.data().lastDate === todayStr();
    } catch { return false; }
  }

  async function getCompletedCount(defiId) {
    if (!isConfigured()) return Data.getCompletedCount(defiId);
    const uid = Auth.getUID();
    if (!uid) return 0;

    try {
      const snap = await getDoc(doc(db, 'users', uid, 'completed', defiId));
      return snap.exists() ? (snap.data().count || 0) : 0;
    } catch { return 0; }
  }

  async function markCompleted(defiId) {
    if (!isConfigured()) { Data.markCompleted(defiId); return; }
    const uid = Auth.getUID();
    if (!uid) return;

    try {
      const ref   = doc(db, 'users', uid, 'completed', defiId);
      const snap  = await getDoc(ref);
      const count = snap.exists() ? (snap.data().count || 0) + 1 : 1;
      await setDoc(ref, { lastDate: todayStr(), count });
    } catch (err) {
      console.error('DB.markCompleted:', err);
      Data.markCompleted(defiId);
    }
  }

  /* ========================================
     JOURNAL
  ======================================== */

  async function getJournal() {
    if (!isConfigured()) return Data.getJournal();
    const uid = Auth.getUID();
    if (!uid) return [];

    try {
      const q    = query(collection(db, 'users', uid, 'journal'), orderBy('date', 'desc'), limit(50));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch { return Data.getJournal(); }
  }

  async function addJournalEntry(entry) {
    if (!isConfigured()) { Data.addJournalEntry(entry); return; }
    const uid = Auth.getUID();
    if (!uid) return;

    try {
      await setDoc(doc(db, 'users', uid, 'journal', entry.id), {
        ...entry,
        date: serverTimestamp(),
      });
    } catch (err) {
      console.error('DB.addJournalEntry:', err);
      Data.addJournalEntry(entry);
    }
  }

  /* ========================================
     BADGES
  ======================================== */

  async function getBadges() {
    if (!isConfigured()) return JSON.parse(localStorage.getItem('soc_badges') || '[]');
    const profile = await getProfile();
    return profile?.badges || [];
  }

  async function unlockBadge(badgeId) {
    const badges = await getBadges();
    if (badges.includes(badgeId)) return false; // déjà débloqué
    badges.push(badgeId);

    if (!isConfigured()) {
      localStorage.setItem('soc_badges', JSON.stringify(badges));
      return true;
    }

    const uid = Auth.getUID();
    if (!uid) return false;
    try {
      await updateDoc(doc(db, 'users', uid), { badges, updatedAt: serverTimestamp() });
      return true;
    } catch { return false; }
  }

  /* ========================================
     LEADERBOARD
  ======================================== */

  async function getLeaderboard() {
    if (!isConfigured()) {
      const user = Data.getUser();
      return Data.getLeaderboard(user.xp);
    }

    try {
      const q    = query(collection(db, 'leaderboard'), orderBy('xp', 'desc'), limit(20));
      const snap = await getDocs(q);
      const uid  = Auth.getUID();
      return snap.docs.map(d => ({
        ...d.data(),
        initials: (d.data().name || '?').slice(0, 2).toUpperCase(),
        isMe: d.id === uid,
      }));
    } catch (err) {
      console.error('DB.getLeaderboard:', err);
      return Data.getLeaderboard(0);
    }
  }

  /* ========================================
     PREMIUM
  ======================================== */

  async function isPremium() {
    if (!isConfigured()) return Data.isPremium();
    const profile = await getProfile();
    return profile?.premium === true;
  }

  async function unlockPremium() {
    if (!isConfigured()) { Data.unlockPremium(); return; }
    await saveProfile({ premium: true });
  }

  /* ========================================
     UTILITAIRES
  ======================================== */

  function todayStr()        { return dateToStr(new Date()); }
  function dateToStr(date)   { return date.toISOString().split('T')[0]; }

  /* ---- API publique ---- */
  return {
    isConfigured,
    getProfile,
    saveProfile,
    updateField,
    addXP,
    updateStreak,
    isCompletedToday,
    getCompletedCount,
    markCompleted,
    getJournal,
    addJournalEntry,
    getBadges,
    unlockBadge,
    getLeaderboard,
    isPremium,
    unlockPremium,
  };

})();
