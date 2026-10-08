/**
 * Item categories shown by the search filters and the home category chips.
 * `value` must match the canonical vocabulary of
 * public/assets/scripts/core/constants.js (items store `category` with it).
 * `searchKey` / `homeKey` are the i18n keys each page already used.
 */
export interface Category {
  value: string;
  label: string;
  searchKey: string;
  homeKey?: string;
}

export const CATEGORIES: Category[] = [
  {
    value: "Ropa y accesorios",
    label: "Ropa y accesorios",
    searchKey: "search_cat_clothing",
    homeKey: "publish.mainInfo.categories.clothing",
  },
  { value: "Libros", label: "Libros", searchKey: "search_cat_books", homeKey: "publish.mainInfo.categories.books" },
  {
    value: "Electrónica",
    label: "Electrónica",
    searchKey: "search_cat_electronics",
    homeKey: "publish.mainInfo.categories.electronics",
  },
  { value: "Hogar", label: "Hogar", searchKey: "search_cat_home", homeKey: "publish.mainInfo.categories.home" },
  {
    value: "Servicios",
    label: "Servicios",
    searchKey: "search_cat_services",
    homeKey: "publish.mainInfo.categories.services",
  },
  { value: "Otros", label: "Otros", searchKey: "search_cat_others" },
];

/** Look up categories by value, keeping the requested order. */
export function pickCategories(values: string[]): Category[] {
  return values.map((v) => {
    const found = CATEGORIES.find((c) => c.value === v);
    if (!found) throw new Error(`Unknown category: ${v}`);
    return found;
  });
}
