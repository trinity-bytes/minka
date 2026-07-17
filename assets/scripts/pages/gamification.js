/**
 * T24 - Lucero Pipa: Lógica para Gamificación y Canjes
 * Maneja puntos, insignias, ranking y catálogo de recompensas.
 */

document.addEventListener("DOMContentLoaded", () => {
  initGamification();
});

// Mock Data
const MOCK_USER_DATA = {
  points: 450,
  level: "Truequero Entusiasta",
  badges: ["verified", "first_trade"],
  optOutRanking: false,
  history: [
    {
      id: 1,
      action: 'Publicar objeto "Bicicleta"',
      points: 10,
      date: "2025-12-01",
      type: "earn",
    },
    {
      id: 2,
      action: 'Cerrar trueque "Libros"',
      points: 30,
      date: "2025-12-03",
      type: "earn",
    },
    {
      id: 3,
      action: "Calificar usuario",
      points: 5,
      date: "2025-12-03",
      type: "earn",
    },
  ],
};

const EARN_ACTIONS = [
  { action: "Publicar un objeto", points: 10, frequency: "Ilimitado" },
  { action: "Cerrar un trueque", points: 30, frequency: "Ilimitado" },
  { action: "Calificar un trueque", points: 5, frequency: "Por trueque" },
  { action: "Verificar identidad", points: 50, frequency: "Única vez" },
  { action: "Invitar a un amigo", points: 20, frequency: "Mensual" },
];

const BADGES = [
  {
    id: "verified",
    name: "Verificado",
    icon: "fa-check-circle",
    description: "Identidad verificada",
  },
  {
    id: "first_trade",
    name: "Primer Trueque",
    icon: "fa-handshake",
    description: "Completaste tu primer trueque",
  },
  {
    id: "top_neighbor",
    name: "Top Vecino",
    icon: "fa-star",
    description: "Top 10 en tu distrito",
  },
  {
    id: "eco_warrior",
    name: "Eco Guerrero",
    icon: "fa-leaf",
    description: "1000 puntos acumulados",
  },
];

const REWARDS = [
  {
    id: 1,
    name: 'Insignia "Super Truequero"',
    cost: 500,
    icon: "fa-medal",
    description: "Destaca en los listados",
  },
  {
    id: 2,
    name: "Destacar Publicación (3 días)",
    cost: 200,
    icon: "fa-bullhorn",
    description: "Tu objeto aparecerá primero",
  },
  {
    id: 3,
    name: "Cupón Café Local",
    cost: 800,
    icon: "fa-coffee",
    description: "Vale por un café en tiendas aliadas",
  },
  {
    id: 4,
    name: "Donación a ONG",
    cost: 1000,
    icon: "fa-heart",
    description: "Mink'a donará $5 a una causa ambiental",
  },
];

const RANKING_DATA = [
  {
    position: 1,
    name: "Maria L.",
    points: 1250,
    avatar: "https://i.pravatar.cc/150?u=1",
  },
  {
    position: 2,
    name: "Juan P.",
    points: 1100,
    avatar: "https://i.pravatar.cc/150?u=2",
  },
  {
    position: 3,
    name: "Usuario Demo",
    points: 450,
    avatar: "https://i.pravatar.cc/200?u=minka-user",
    isMe: true,
  },
  {
    position: 4,
    name: "Carlos R.",
    points: 420,
    avatar: "https://i.pravatar.cc/150?u=3",
  },
  {
    position: 5,
    name: "Ana S.",
    points: 380,
    avatar: "https://i.pravatar.cc/150?u=4",
  },
];

function initGamification() {
  loadUserData();
  renderBadges();
  renderEarnTable();
  renderRewards();
  renderRanking();
  renderHistory();
  setupTabs();
  setupOptOut();
}

function loadUserData() {
  // In a real app, fetch from API
  const pointsEl = document.getElementById("user-points");
  const levelEl = document.getElementById("user-level");
  const optOutCheckbox = document.getElementById("opt-out-ranking");

  if (pointsEl) pointsEl.textContent = MOCK_USER_DATA.points;
  if (levelEl) levelEl.textContent = MOCK_USER_DATA.level;
  if (optOutCheckbox) optOutCheckbox.checked = MOCK_USER_DATA.optOutRanking;
}

function renderBadges() {
  const container = document.getElementById("user-badges");
  if (!container) return;

  container.innerHTML = BADGES.map((badge) => {
    const isEarned = MOCK_USER_DATA.badges.includes(badge.id);
    return `
            <div class="badge-item ${isEarned ? "earned" : ""}" title="${
      badge.description
    }">
                <div class="badge-icon">
                    <i class="fas ${badge.icon}"></i>
                </div>
                <span class="badge-name">${badge.name}</span>
            </div>
        `;
  }).join("");
}

function renderEarnTable() {
  const tbody = document.getElementById("earn-actions-body");
  if (!tbody) return;

  tbody.innerHTML = EARN_ACTIONS.map(
    (item) => `
        <tr>
            <td>${item.action}</td>
            <td style="color: var(--primary-color); font-weight: bold;">+${item.points}</td>
            <td>${item.frequency}</td>
        </tr>
    `
  ).join("");
}

function renderRewards() {
  const container = document.getElementById("rewards-catalog");
  if (!container) return;

  container.innerHTML = REWARDS.map((reward) => {
    const canAfford = MOCK_USER_DATA.points >= reward.cost;
    return `
            <div class="reward-card">
                <div class="reward-icon"><i class="fas ${
                  reward.icon
                }"></i></div>
                <h3>${reward.name}</h3>
                <p>${reward.description}</p>
                <div class="reward-cost">${reward.cost} pts</div>
                <button class="btn-redeem" 
                    onclick="redeemReward(${reward.id})" 
                    ${!canAfford ? "disabled" : ""}>
                    ${canAfford ? "Canjear" : "Puntos insuficientes"}
                </button>
            </div>
        `;
  }).join("");
}

function renderRanking() {
  const container = document.getElementById("ranking-list");
  if (!container) return;

  if (MOCK_USER_DATA.optOutRanking) {
    container.innerHTML =
      '<p style="text-align:center; padding: 2rem; color: #666;">Has decidido no participar en el ranking público.</p>';
    return;
  }

  container.innerHTML = RANKING_DATA.map(
    (user) => `
        <div class="ranking-item ${user.isMe ? "highlight" : ""}" style="${
      user.isMe ? "background-color: #f0fdf4;" : ""
    }">
            <div class="ranking-position">${user.position}</div>
            <div class="ranking-user">
                <img src="${user.avatar}" alt="${
      user.name
    }" class="ranking-avatar">
                <span>${user.name} ${user.isMe ? "(Tú)" : ""}</span>
            </div>
            <div class="ranking-points">${user.points} pts</div>
        </div>
    `
  ).join("");
}

function renderHistory() {
  const container = document.getElementById("points-history");
  if (!container) return;

  // Sort by date desc
  const sortedHistory = [...MOCK_USER_DATA.history].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  container.innerHTML = sortedHistory
    .map(
      (item) => `
        <li class="history-item">
            <div>
                <div class="history-action">${item.action}</div>
                <span class="history-date">${item.date}</span>
            </div>
            <div class="history-points ${
              item.type === "earn" ? "positive" : "negative"
            }">
                ${item.type === "earn" ? "+" : "-"}${item.points}
            </div>
        </li>
    `
    )
    .join("");
}

function setupTabs() {
  const tabs = document.querySelectorAll(".tab-btn");
  const contents = document.querySelectorAll(".tab-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Remove active class from all
      tabs.forEach((t) => t.classList.remove("active"));
      contents.forEach((c) => c.classList.remove("active"));

      // Add active to current
      tab.classList.add("active");
      const targetId = tab.getAttribute("data-tab");
      document.getElementById(targetId).classList.add("active");
    });
  });
}

function setupOptOut() {
  const checkbox = document.getElementById("opt-out-ranking");
  if (!checkbox) return;

  checkbox.addEventListener("change", (e) => {
    MOCK_USER_DATA.optOutRanking = e.target.checked;
    renderRanking();
    // In real app, save preference to server
    alert(
      e.target.checked
        ? "Te has ocultado del ranking público."
        : "Ahora eres visible en el ranking."
    );
  });
}

// Global function for onclick
window.redeemReward = function (rewardId) {
  const reward = REWARDS.find((r) => r.id === rewardId);
  if (!reward) return;

  if (MOCK_USER_DATA.points >= reward.cost) {
    if (
      confirm(
        `¿Estás seguro de canjear "${reward.name}" por ${reward.cost} puntos?`
      )
    ) {
      // Deduct points
      MOCK_USER_DATA.points -= reward.cost;

      // Add to history
      MOCK_USER_DATA.history.unshift({
        id: Date.now(),
        action: `Canje: ${reward.name}`,
        points: reward.cost,
        date: new Date().toISOString().split("T")[0],
        type: "spend",
      });

      // Re-render
      loadUserData();
      renderRewards(); // Update button states
      renderHistory();

      alert("¡Canje exitoso! Disfruta tu recompensa.");
    }
  } else {
    alert("No tienes suficientes puntos.");
  }
};
