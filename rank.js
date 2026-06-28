/* ================================================
   rank.js — Classement / Leaderboard
   Sociability App
   ================================================ */

const Rank = (() => {

  /* ---- Couleurs pour avatars simulés ---- */
  const AVATAR_COLORS = [
    { color: '#7C3AED', bg: 'rgba(124,58,237,0.18)' },
    { color: '#22D3EE', bg: 'rgba(34,211,238,0.14)' },
    { color: '#34D399', bg: 'rgba(52,211,153,0.14)' },
    { color: '#FBBF24', bg: 'rgba(251,191,36,0.14)' },
    { color: '#F87171', bg: 'rgba(248,113,113,0.14)' },
    { color: '#A78BFA', bg: 'rgba(167,139,250,0.14)' },
    { color: '#FB923C', bg: 'rgba(251,146,60,0.14)'  },
    { color: '#60A5FA', bg: 'rgba(96,165,250,0.14)'  },
  ];

  function getAvatarStyle(index) {
    return AVATAR_COLORS[index % AVATAR_COLORS.length];
  }

  /* ---- Rendu complet ---- */
  function render() {
    const user        = Data.getUser();
    const leaderboard = Data.getLeaderboard(user.xp);

    renderPodium(leaderboard.slice(0, 3));
    renderList(leaderboard);
    renderSubtitle(leaderboard.length);
  }

  /* ---- Sous-titre ---- */
  function renderSubtitle(count) {
    const el = document.getElementById('rank-subtitle');
    if (el) el.textContent = `Cette semaine · ${count} participants`;
  }

  /* ---- Podium Top 3 ---- */
  function renderPodium(top3) {
    const podium = document.getElementById('podium');
    if (!podium || top3.length < 3) return;

    // Ordre d'affichage : 2e, 1er, 3e
    const order = [top3[1], top3[0], top3[2]];
    const classes = ['p2', 'p1', 'p3'];
    const heights = [58, 80, 44];
    const ranks   = ['2', '👑', '3'];

    podium.innerHTML = order.map((player, i) => {
      const cls    = classes[i];
      const height = heights[i];
      const rank   = ranks[i];
      const style  = getAvatarStyle(i);

      return `
        <div class="podium-place ${cls}">
          <div class="podium-avatar"
               style="background:${style.bg};color:${style.color};border-color:${style.color}">
            ${player.initials || player.name.slice(0,2).toUpperCase()}
          </div>
          <div class="podium-name">${player.name}</div>
          <div class="podium-xp">${player.xp.toLocaleString('fr-FR')} XP</div>
          <div class="podium-block" style="height:${height}px">${rank}</div>
        </div>`;
    }).join('');
  }

  /* ---- Liste à partir du rang 4 (+ joueur si hors top 3) ---- */
  function renderList(leaderboard) {
    const list = document.getElementById('rank-list');
    if (!list) return;

    // Afficher tous à partir du rang 4, mais toujours montrer le joueur
    const items = leaderboard.slice(3);

    // Si le joueur n'est pas dans les rangs affichés, l'ajouter avec un séparateur
    const meInItems = items.find(p => p.isMe);

    list.innerHTML = items.map((player, i) => {
      const rank  = i + 4;
      const style = getAvatarStyle(rank - 1);
      const isMe  = !!player.isMe;

      return `
        <div class="rank-item${isMe ? ' me' : ''}">
          <div class="rank-num" ${isMe ? 'style="color:var(--purple-soft)"' : ''}>
            ${rank}
          </div>
          <div class="rank-av" style="background:${isMe ? 'var(--purple)' : style.bg};color:${isMe ? '#fff' : style.color}">
            ${player.initials || player.name.slice(0,2).toUpperCase()}
          </div>
          <div class="rank-name">
            ${player.name}
            ${isMe ? '<span class="you-badge">toi</span>' : ''}
          </div>
          <div class="rank-xp">${player.xp.toLocaleString('fr-FR')}</div>
        </div>`;
    }).join('');
  }

  return { render };

})();