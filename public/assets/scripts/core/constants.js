(function () {
  "use strict";

  // Vocabulario canónico de categorías (coincide con los <option> de
  // publicar.html y busqueda.html).
  const CATEGORIES = [
    "Ropa y accesorios",
    "Libros",
    "Electrónica",
    "Hogar",
    "Muebles",
    "Servicios",
    "Otros",
  ];

  // Factores de impacto ambiental por categoría (CO2 kg, Agua L)
  const ECO_FACTORS = {
    "Ropa y accesorios": { co2: 5, water: 2000 },
    Libros: { co2: 1, water: 10 },
    Electrónica: { co2: 20, water: 500 },
    Hogar: { co2: 8, water: 100 },
    Muebles: { co2: 15, water: 0 },
    Servicios: { co2: 2, water: 0 },
    Otros: { co2: 2, water: 20 },
  };

  window.MINKA_CONSTANTS = { CATEGORIES: CATEGORIES, ECO_FACTORS: ECO_FACTORS };
})();
