/**
 * Google Play listing of the Android app. The app is not published yet, so
 * this stays null: install links fall back to the #descargar section and the
 * install QR codes are not rendered. Set the listing URL here once it exists.
 */
export const PLAY_STORE_URL: string | null = null;

/** Target of every install link outside #descargar. */
export const INSTALL_HREF = PLAY_STORE_URL ?? "#descargar";
