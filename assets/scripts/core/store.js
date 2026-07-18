/**
 * Mink'a - Store: acceso centralizado a localStorage.
 * Todos los page scripts leen/escriben datos a través de window.Store.
 * Claves normalizadas con underscore; migra las claves legacy una sola vez.
 */
(function () {
  "use strict";

  const KEYS = {
    items: "minka_items",
    draft: "minka_publish_draft",
    favorites: "minka_favorites",
    savedSearches: "minka_saved_searches",
    searchHistory: "minka_search_history",
    searchFilters: "minka_search_filters",
    chatThread: "minka_chat_thread",
    chatMessages: "minka_chat_messages",
    chatDynamicThreads: "minka_chat_dynamic_threads",
    notifications: "minka_notifications",
    notifPreferences: "minka_notif_preferences",
    gamification: "minka_gamification",
    community: "minka_community",
    profile: "minka_profile",
    preferences: "minka_preferences",
    dashboard: "minka_dashboard",
  };

  // Migración única de claves legacy (con guion o nombre viejo)
  const LEGACY = {
    minka_published_items: KEYS.items,
    "minka-notif-feed": KEYS.notifications,
    "minka-notif-preferences": KEYS.notifPreferences,
    "minka-chat-thread": KEYS.chatThread,
  };
  Object.entries(LEGACY).forEach(([oldKey, newKey]) => {
    const value = localStorage.getItem(oldKey);
    if (value !== null && localStorage.getItem(newKey) === null) {
      localStorage.setItem(newKey, value);
    }
    if (value !== null) localStorage.removeItem(oldKey);
  });

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (error) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn("Store: no se pudo escribir", key, error);
      return false;
    }
  }

  const Store = {
    // ── Items ──────────────────────────────────────────────
    getItems() {
      const items = read(KEYS.items, []);
      return Array.isArray(items) ? items : [];
    },
    getItem(id) {
      return Store.getItems().find((i) => i.id === id) || null;
    },
    saveItem(item) {
      const items = Store.getItems();
      items.unshift(item);
      return write(KEYS.items, items);
    },
    updateItem(id, patch) {
      const items = Store.getItems().map((i) =>
        i.id === id ? { ...i, ...patch } : i
      );
      return write(KEYS.items, items);
    },
    deleteItem(id) {
      return write(
        KEYS.items,
        Store.getItems().filter((i) => i.id !== id)
      );
    },

    // ── Borrador de publicación ────────────────────────────
    getDraft() {
      return read(KEYS.draft, null);
    },
    saveDraft(draft) {
      return write(KEYS.draft, draft);
    },

    // ── Favoritos ──────────────────────────────────────────
    getFavorites() {
      return read(KEYS.favorites, []);
    },
    isFavorite(id) {
      return Store.getFavorites().includes(id);
    },
    toggleFavorite(id) {
      const favorites = Store.getFavorites();
      const idx = favorites.indexOf(id);
      if (idx === -1) favorites.push(id);
      else favorites.splice(idx, 1);
      write(KEYS.favorites, favorites);
      return favorites;
    },

    // ── Búsquedas ──────────────────────────────────────────
    getSavedSearches() {
      return read(KEYS.savedSearches, []);
    },
    saveSearches(list) {
      return write(KEYS.savedSearches, list);
    },
    getSearchHistory() {
      return read(KEYS.searchHistory, []);
    },
    saveSearchHistory(list) {
      return write(KEYS.searchHistory, list);
    },
    getSearchFilters() {
      return read(KEYS.searchFilters, null);
    },
    saveSearchFilters(filters) {
      return write(KEYS.searchFilters, filters);
    },

    // ── Chat ───────────────────────────────────────────────
    getChatThread() {
      return read(KEYS.chatThread, null);
    },
    saveChatThread(id) {
      return write(KEYS.chatThread, id);
    },
    getMessages(threadId) {
      const all = read(KEYS.chatMessages, {});
      return Array.isArray(all[threadId]) ? all[threadId] : [];
    },
    saveMessages(threadId, msgs) {
      const all = read(KEYS.chatMessages, {});
      all[threadId] = msgs;
      return write(KEYS.chatMessages, all);
    },
    getDynamicThreads() {
      return read(KEYS.chatDynamicThreads, []);
    },
    saveDynamicThread(meta) {
      const list = Store.getDynamicThreads();
      if (!list.some((t) => t.id === meta.id)) {
        list.push(meta);
        return write(KEYS.chatDynamicThreads, list);
      }
      return true;
    },

    // ── Notificaciones ─────────────────────────────────────
    getNotifications() {
      return read(KEYS.notifications, []);
    },
    saveNotifications(list) {
      return write(KEYS.notifications, list);
    },
    addNotification({ type, title, text, payload = {} }) {
      const feed = Store.getNotifications();
      feed.unshift({
        id: "n-" + Date.now(),
        type: type,
        title: title,
        text: text,
        payload: payload,
        time: "Ahora",
        unread: true,
      });
      const ok = write(KEYS.notifications, feed);
      // En window, NO en document: notif-badge.js escucha en window.
      window.dispatchEvent(new Event("minka-feed-update"));
      return ok;
    },
    getNotifPreferences() {
      return read(KEYS.notifPreferences, null);
    },
    saveNotifPreferences(prefs) {
      return write(KEYS.notifPreferences, prefs);
    },

    // ── Gamification ───────────────────────────────────────
    getGame() {
      return read(KEYS.gamification, null);
    },
    saveGame(state) {
      return write(KEYS.gamification, state);
    },

    // ── Comunidad ──────────────────────────────────────────
    getCommunity() {
      return read(KEYS.community, null);
    },
    saveCommunity(state) {
      return write(KEYS.community, state);
    },

    // ── Perfil ─────────────────────────────────────────────
    getProfile() {
      return read(KEYS.profile, {});
    },
    saveProfile(patch) {
      return write(KEYS.profile, { ...Store.getProfile(), ...patch });
    },

    // ── Preferencias ───────────────────────────────────────
    getPreferences() {
      return read(KEYS.preferences, {});
    },
    savePreferences(patch) {
      return write(KEYS.preferences, { ...Store.getPreferences(), ...patch });
    },

    // ── Dashboard ──────────────────────────────────────────
    getDashboard() {
      return read(KEYS.dashboard, null);
    },
    saveDashboard(data) {
      return write(KEYS.dashboard, data);
    },

    // ── Datos demo (first-run) ─────────────────────────────
    seedDemo() {
      const now = Date.now();
      const day = 24 * 60 * 60 * 1000;
      const base = {
        condition: "Buen estado",
        availability: "Fines de semana",
        status: "activo",
        reserved: false,
        mode: ["Recojo en punto acordado"],
        notes: "",
        dynamicData: {},
        qrCode: null,
      };
      const demoItems = [
        {
          ...base,
          id: "itm-001",
          title: "Bicicleta urbana vintage",
          category: "Otros",
          description:
            "Bicicleta clásica restaurada, lista para moverte por la ciudad.",
          tags: ["movilidad", "urbano", "bicicleta"],
          location: "Miraflores",
          rating: 4.8,
          distanceKm: 4,
          images: ["../assets/images/items/bicicleta-vintage.jpg"],
          owner: { id: "vec-1", name: "María Quispe", location: "Miraflores", rating: 4.8 },
          publishedAt: new Date(now - 2 * day).toISOString(),
        },
        {
          ...base,
          id: "itm-002",
          title: "Set de libros ciencia ficción",
          category: "Libros",
          description: "Colección de 8 novelas de ciencia ficción en buen estado.",
          tags: ["libros", "sci-fi", "colección"],
          location: "San Borja",
          rating: 4.2,
          distanceKm: 9,
          images: ["../assets/images/items/set-libros.jpg"],
          owner: { id: "vec-2", name: "Jorge Mamani", location: "San Borja", rating: 4.5 },
          publishedAt: new Date(now - 5 * day).toISOString(),
        },
        {
          ...base,
          id: "itm-003",
          title: "Laptop ligera i5",
          category: "Electrónica",
          description: "Laptop de trabajo, batería nueva, ideal para estudiar.",
          tags: ["tech", "trabajo", "portátil"],
          location: "Pueblo Libre",
          rating: 4.9,
          distanceKm: 18,
          images: ["../assets/images/items/laptop-i5.svg"],
          owner: { id: "vec-3", name: "Rosa Huamán", location: "Pueblo Libre", rating: 4.9 },
          publishedAt: new Date(now - 1 * day).toISOString(),
        },
        {
          ...base,
          id: "itm-004",
          title: "Mesa de centro reciclada",
          category: "Hogar",
          description: "Mesa de madera reciclada con acabado natural.",
          tags: ["madera", "reciclado", "hogar"],
          location: "Barranco",
          rating: 4.1,
          distanceKm: 6,
          images: ["../assets/images/items/mesa-centro.jpg"],
          owner: { id: "vec-4", name: "Luis Ccopa", location: "Barranco", rating: 4.2 },
          publishedAt: new Date(now - 8 * day).toISOString(),
        },
        {
          ...base,
          id: "itm-005",
          title: "Clases de guitarra",
          category: "Servicios",
          description: "Clases de guitarra a domicilio, nivel inicial e intermedio.",
          tags: ["música", "clases", "servicio"],
          location: "Surco",
          rating: 4.5,
          distanceKm: 12,
          images: ["../assets/images/items/guitarra-acustica.jpg"],
          owner: { id: "vec-5", name: "Ana Torres", location: "Surco", rating: 4.6 },
          publishedAt: new Date(now - 3 * day).toISOString(),
        },
        {
          ...base,
          id: "itm-006",
          title: "Abrigo de lana mujer M",
          category: "Ropa y accesorios",
          description: "Abrigo de lana talla M, poco uso, abriga muchísimo.",
          tags: ["ropa", "abrigo", "mujer"],
          location: "La Molina",
          rating: 3.9,
          distanceKm: 3,
          images: ["../assets/images/items/abrigo-lana-mujer.jpg"],
          owner: { id: "vec-6", name: "Carla Ríos", location: "La Molina", rating: 4.0 },
          publishedAt: new Date(now - 12 * day).toISOString(),
        },
        {
          ...base,
          id: "itm-007",
          title: "Estantería de pino",
          category: "Muebles",
          description: "Estantería de pino de 4 niveles, desarmable.",
          tags: ["mueble", "estante", "pino"],
          location: "Jesús María",
          rating: 4.4,
          distanceKm: 7,
          images: ["../assets/images/items/estante-pino.svg"],
          owner: { id: "vec-7", name: "Pedro Salas", location: "Jesús María", rating: 4.3 },
          publishedAt: new Date(now - 6 * day).toISOString(),
        },
      ];
      const existing = Store.getItems();
      const merged = [
        ...existing,
        ...demoItems.filter((d) => !existing.some((e) => e.id === d.id)),
      ];
      write(KEYS.items, merged);
      return demoItems.length;
    },
  };

  window.Store = Store;
})();
