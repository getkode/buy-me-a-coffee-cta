const SYSTEM_FONTS = new Set(["system-ui, sans-serif", "Georgia, serif"]);
const loadedFonts = new Set<string>();

const GOOGLE_FONT_FAMILIES: Record<string, string> = {
  "Inter, sans-serif": "Inter",
  "Roboto, sans-serif": "Roboto",
  "Open Sans, sans-serif": "Open+Sans",
  "Lato, sans-serif": "Lato",
  "Poppins, sans-serif": "Poppins",
  "Montserrat, sans-serif": "Montserrat",
  "Merriweather, serif": "Merriweather",
  "Playfair Display, serif": "Playfair+Display",
};

export function ensureFontLoaded(fontFamily: string): void {
  if (SYSTEM_FONTS.has(fontFamily)) return;

  const googleFamily = GOOGLE_FONT_FAMILIES[fontFamily];
  if (!googleFamily || loadedFonts.has(googleFamily)) return;

  loadedFonts.add(googleFamily);

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${googleFamily}:wght@400;700&display=swap`;
  document.head.appendChild(link);
}
