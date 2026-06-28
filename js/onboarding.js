/* ================================================
   onboarding.js — Première visite
   Sociability App
   ================================================ */

const Onboarding = (() => {

  let currentStep = 0;

  const STEPS = [
    {
      emoji: '👋',
      title: 'Bienvenue sur\nSociability',
      desc:  'L\'app qui transforme la socialisation en jeu. Des défis progressifs, des récompenses, et une communauté pour t\'encourager.',
      btn:   'Commencer →',
    },
    {
      emoji: '🎯',
      title: 'Des défis pour grandir',
      desc:  'Chaque jour, relève des défis adaptés à ton niveau. De "dire bonjour à un inconnu" jusqu\'au stand-up devant 10 personnes.',
      btn:   'Suivant →',
    },
    {
      emoji: '🏆',
      title: 'Monte dans le classement',
      desc:  'Gagne des XP, débloques des badges secrets, et grimpe dans le classement de la communauté.',
      btn:   'Suivant →',
    },
    {
      emoji: '✏️',
      title: 'Comment tu t\'appelles ?',
      desc:  'Ton prénom sera affiché dans le classement et personnalise ton expérience.',
      btn:   'C\'est parti ! 🚀',
      isNameStep: true,
    },
  ];

  /* ---- Vérifier si l'onboarding a déjà été fait ---- */
  function isDone() {
    return localStorage.getItem('soc_onboarding_done') === 'true';
  }

  function markDone() {
    localStorage.setItem('soc_onboarding_done', 'true');
  }

  /* ---- Afficher l'onboarding ---- */
  function show() {
    const screen = document.getElementById('s-onboarding');
    if (!screen) return;

    // Cacher toutes les autres screens + nav
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelector('.bottom-nav')?.style.setProperty('display', 'none');

    screen.classList.add('active');
    currentStep = 0;
    renderStep();
  }

  function renderStep() {
    const step       = STEPS[currentStep];
    const total      = STEPS.length;
    const isLastStep = currentStep === total - 1;

    document.getElementById('ob-emoji').textContent   = step.emoji;
    document.getElementById('ob-title').textContent   = step.title;
    document.getElementById('ob-desc').textContent    = step.desc;
    document.getElementById('ob-btn').textContent     = step.btn;

    // Barre de progression
    const dots = document.querySelectorAll('.ob-dot');
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === currentStep);
    });

    // Champ prénom
    const nameWrap = document.getElementById('ob-name-wrap');
    if (nameWrap) nameWrap.style.display = step.isNameStep ? 'block' : 'none';

    // Focus sur l'input si step prénom
    if (step.isNameStep) {
      setTimeout(() => document.getElementById('ob-name-input')?.focus(), 200);
    }
  }

  function next() {
    const step = STEPS[currentStep];

    // Valider le prénom sur le dernier step
    if (step.isNameStep) {
      const name = document.getElementById('ob-name-input')?.value.trim();
      if (!name || name.length < 2) {
        document.getElementById('ob-name-error').textContent = 'Entre au moins 2 caractères 😊';
        return;
      }
      // Sauvegarder le prénom
      saveName(name);
    }

    if (currentStep < STEPS.length - 1) {
      currentStep++;
      animateStep();
    } else {
      finish();
    }
  }

  function animateStep() {
    const content = document.getElementById('ob-content');
    if (!content) { renderStep(); return; }
    content.style.opacity   = '0';
    content.style.transform = 'translateX(20px)';
    setTimeout(() => {
      renderStep();
      content.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      content.style.opacity    = '1';
      content.style.transform  = 'translateX(0)';
    }, 150);
  }

  async function saveName(name) {
    // Sauvegarder localement et dans Firestore
    const user = Data.getUser();
    user.name  = name;
    Data.saveUser(user);

    if (Auth.isReady()) {
      await DB.saveProfile({ name, xp: 0, streak: 0, premium: false, badges: [] });
    }
  }

  function finish() {
    markDone();

    // Cacher onboarding, afficher app
    document.getElementById('s-onboarding').classList.remove('active');
    document.querySelector('.bottom-nav')?.style.removeProperty('display');

    // Lancer l'app normalement
    App.init(true); // true = skip onboarding check
  }

  /* ---- Injection du HTML de l'onboarding ---- */
  function injectHTML() {
    if (document.getElementById('s-onboarding')) return;

    const screen = document.createElement('div');
    screen.id        = 's-onboarding';
    screen.className = 'screen ob-screen';
    screen.innerHTML = `
      <div class="ob-bg-glow" aria-hidden="true"></div>

      <div class="ob-dots">
        ${STEPS.map((_, i) => `<div class="ob-dot${i === 0 ? ' active' : ''}"></div>`).join('')}
      </div>

      <div class="ob-content" id="ob-content">
        <div class="ob-emoji" id="ob-emoji"></div>
        <div class="ob-title" id="ob-title"></div>
        <div class="ob-desc"  id="ob-desc"></div>

        <div class="ob-name-wrap" id="ob-name-wrap" style="display:none">
          <input
            class="ob-name-input"
            id="ob-name-input"
            type="text"
            placeholder="Ton prénom..."
            maxlength="20"
            autocomplete="given-name"
          />
          <div class="ob-name-error" id="ob-name-error" role="alert"></div>
        </div>
      </div>

      <div class="ob-footer">
        <button class="ob-btn" id="ob-btn" onclick="Onboarding.next()"></button>
      </div>
    `;

    // Insérer avant le bottom-nav
    document.body.insertBefore(screen, document.querySelector('.bottom-nav'));
  }

  return {
    isDone,
    show,
    next,
    injectHTML,
  };

})();
