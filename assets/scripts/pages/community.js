// T32 - Retos Comunitarios (HU38)
// Estado persistido en Store: { challenges: [...], joined: [ids] }

const SEED_CHALLENGES = [
  {
    id: "ch-001",
    title: "Semana del Libro",
    description:
      "Intercambia 5 libros en tu distrito para fomentar la lectura.",
    district: "Miraflores",
    type: "individual",
    goal: 5,
    current: 2,
    deadline: "2025-12-15",
    reward: "Insignia Lector",
    points: 50,
    collectiveGoal: 1000,
    collectiveCurrent: 750,
  },
  {
    id: "ch-002",
    title: "Limpieza de Closet",
    description: "Dale una segunda vida a 10 prendas de ropa.",
    district: "Miraflores",
    type: "individual",
    goal: 10,
    current: 8,
    deadline: "2025-12-20",
    reward: "Eco-Moda Badge",
    points: 100,
    collectiveGoal: 5000,
    collectiveCurrent: 3200,
  },
  {
    id: "ch-003",
    title: "Tecnología Circular",
    description: "Intercambia 3 artículos electrónicos en desuso.",
    district: "Barranco",
    type: "individual",
    goal: 3,
    current: 0,
    deadline: "2025-12-30",
    reward: "Tech Saver",
    points: 150,
    collectiveGoal: 500,
    collectiveCurrent: 120,
  },
  {
    id: "ch-004",
    title: "Hogar Renovado",
    description: "Intercambia 4 artículos de hogar en San Borja.",
    district: "San Borja",
    type: "individual",
    goal: 4,
    current: 0,
    deadline: "2025-12-28",
    reward: "Hogar Circular",
    points: 80,
    collectiveGoal: 800,
    collectiveCurrent: 260,
  },
  {
    id: "ch-005",
    title: "Juguetes que Vuelven",
    description: "Dale una segunda vida a 5 juguetes en Jesús María.",
    district: "Jesús María",
    type: "individual",
    goal: 5,
    current: 0,
    deadline: "2026-01-10",
    reward: "Amigo de la Infancia",
    points: 90,
    collectiveGoal: 600,
    collectiveCurrent: 150,
  },
  {
    id: "ch-006",
    title: "Biblioteca Abierta",
    description: "Comparte 6 libros con vecinos de Magdalena.",
    district: "Magdalena",
    type: "individual",
    goal: 6,
    current: 0,
    deadline: "2026-01-15",
    reward: "Lector Solidario",
    points: 70,
    collectiveGoal: 400,
    collectiveCurrent: 90,
  },
  {
    id: "ch-007",
    title: "Deporte para Todos",
    description: "Intercambia 3 artículos deportivos en La Molina.",
    district: "La Molina",
    type: "individual",
    goal: 3,
    current: 0,
    deadline: "2026-01-20",
    reward: "Espíritu Deportivo",
    points: 110,
    collectiveGoal: 300,
    collectiveCurrent: 45,
  },
  {
    id: "ch-008",
    title: "Moda Circular Surquillo",
    description: "Renueva tu ropero: intercambia 5 prendas.",
    district: "Surquillo",
    type: "individual",
    goal: 5,
    current: 0,
    deadline: "2026-01-25",
    reward: "Eco-Estilo",
    points: 95,
    collectiveGoal: 700,
    collectiveCurrent: 180,
  },
];

const state = (window.Store && Store.getCommunity()) || {
  challenges: SEED_CHALLENGES,
  joined: [],
};
if (window.Store && !Store.getCommunity()) Store.saveCommunity(state);

const el = {
  grid: document.getElementById("challenges-grid"),
  districtSelect: document.getElementById("district-select"),
  userDistrict: document.getElementById("user-district-display"),
};

// Distrito del usuario: sesión → preferencias → fallback
const currentUser = {
  district:
    (window.Session && Session.getSession()?.district) ||
    (window.Store && Store.getPreferences().district) ||
    "Miraflores",
};

function init() {
  if (el.userDistrict) {
    el.userDistrict.textContent = `Tu distrito: ${currentUser.district}`;
  }
  if (el.districtSelect) {
    el.districtSelect.value = currentUser.district;
    el.districtSelect.addEventListener("change", (e) => {
      currentUser.district = e.target.value;
      renderChallenges();
    });
  }

  renderChallenges();
}

function joinChallenge(id) {
  const challenge = state.challenges.find((c) => c.id === id);
  if (!challenge || state.joined.includes(id)) return;
  challenge.current += 1;
  challenge.collectiveCurrent += 1;
  state.joined.push(id);
  if (window.Store) {
    Store.saveCommunity(state);
    Store.addNotification({
      type: "reminder",
      title: "Te uniste a un reto",
      text: `Participas en "${challenge.title}" (${challenge.district}).`,
      payload: { challengeId: id },
    });
  }
  renderChallenges();
}

function renderChallenges() {
  const filtered = state.challenges.filter(
    (c) => c.district === currentUser.district
  );

  if (filtered.length === 0) {
    el.grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
        <i class="fas fa-map-marker-alt" style="font-size: 3rem; color: var(--text-secondary); margin-bottom: 1rem;"></i>
        <h3>No hay retos activos en ${currentUser.district}</h3>
        <p>¡Prueba seleccionando otro distrito o vuelve pronto!</p>
      </div>
    `;
    return;
  }

  el.grid.innerHTML = filtered
    .map((challenge) => {
      const individualProgress = (challenge.current / challenge.goal) * 100;
      const collectiveProgress =
        (challenge.collectiveCurrent / challenge.collectiveGoal) * 100;

      return `
      <article class="challenge-card">
        <div class="challenge-card__header">
          <span class="challenge-card__badge">${challenge.district}</span>
          <span style="font-size: 0.875rem; color: var(--text-secondary);">
            <i class="far fa-clock"></i> Hasta ${new Date(
              challenge.deadline
            ).toLocaleDateString()}
          </span>
        </div>
        <div class="challenge-card__body">
          <h3 class="challenge-card__title">${challenge.title}</h3>
          <p class="challenge-card__desc">${challenge.description}</p>
          
          <div class="progress-section">
            <div class="progress-label">
              <span>Tu Progreso</span>
              <span>${challenge.current} / ${challenge.goal}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${individualProgress}%"></div>
            </div>
          </div>

          <div class="progress-section">
            <div class="progress-label">
              <span>Meta Distrital</span>
              <span>${Math.round(collectiveProgress)}% completado</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill collective" style="width: ${collectiveProgress}%"></div>
            </div>
            <small style="color: var(--text-secondary); font-size: 0.75rem;">
              ${challenge.collectiveCurrent} de ${
        challenge.collectiveGoal
      } intercambios
            </small>
          </div>
        </div>
        <div class="challenge-card__footer">
          <div class="reward-badge">
            <i class="fas fa-trophy"></i>
            <span>${challenge.reward} (+${challenge.points} pts)</span>
          </div>
          <button class="btn btn-primary btn-sm" data-join="${challenge.id}" ${
            individualProgress >= 100 || state.joined.includes(challenge.id)
              ? "disabled"
              : ""
          }>
            ${
              individualProgress >= 100
                ? "Completado"
                : state.joined.includes(challenge.id)
                ? "Participando"
                : "Participar"
            }
          </button>
        </div>
      </article>
    `;
    })
    .join("");

  el.grid.querySelectorAll("[data-join]").forEach((btn) => {
    btn.addEventListener("click", () => joinChallenge(btn.dataset.join));
  });
}

document.addEventListener("DOMContentLoaded", init);
