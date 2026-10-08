/**
 * Environmental impact factors per item category (CO2 kg avoided, water L
 * saved) used by the detail page when a trade is closed. Moved from the
 * legacy public/assets/scripts/core/constants.js (window.MINKA_CONSTANTS),
 * whose only consumer was the detail page. Keys follow the item category
 * vocabulary (see ./categories.ts), plus legacy "Muebles".
 */
export interface EcoFactor {
  co2: number;
  water: number;
}

export const ECO_FACTORS: Record<string, EcoFactor> = {
  "Ropa y accesorios": { co2: 5, water: 2000 },
  Libros: { co2: 1, water: 10 },
  Electrónica: { co2: 20, water: 500 },
  Hogar: { co2: 8, water: 100 },
  Muebles: { co2: 15, water: 0 },
  Servicios: { co2: 2, water: 0 },
  Otros: { co2: 2, water: 20 },
};
