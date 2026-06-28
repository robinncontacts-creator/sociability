/* ================================================
   auth.js — Authentification anonyme Firebase
   Sociability App

   Chaque visiteur reçoit un UID unique anonyme.
   Ses données sont liées à cet UID dans Firestore.
   ================================================ */

const Auth = (() => {

  let currentUser = null;

  /* ---- Initialiser l'auth au chargement ---- */
  async function init() {
    return new Promise((resolve) => {
      FirebaseApp.onAuthStateChanged(FirebaseApp.auth, async (user) => {
        if (user) {
          currentUser = user;
          console.log("Auth: utilisateur connecté →", user.uid);
          resolve(user);
        } else {
          // Première visite : créer un compte anonyme
          try {
            const result = await FirebaseApp.signInAnonymously(FirebaseApp.auth);
            currentUser  = result.user;
            console.log("Auth: nouvel anonyme créé →", result.user.uid);
            resolve(result.user);
          } catch (err) {
            console.error("Auth: erreur connexion anonyme →", err);
            resolve(null);
          }
        }
      });
    });
  }

  /* ---- Getters ---- */
  function getUID()  { return currentUser?.uid || null; }
  function getUser() { return currentUser; }
  function isReady() { return currentUser !== null; }

  return { init, getUID, getUser, isReady };

})();
