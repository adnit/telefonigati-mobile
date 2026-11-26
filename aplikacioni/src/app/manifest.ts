import type { MetadataRoute } from "next";

// Fushat e Chrome për lidhjet (ende jo në tipet e Next.js): në Android, linqet e aplikacionit
// hapen në aplikacionin e instaluar kur është e mundur, dhe ripërdorin dritaren e hapur.
// iPhone nuk e mbështet: atje linqet hapen gjithmonë në Safari.
type ManifestMeLidhje = MetadataRoute.Manifest & {
  handle_links?: "auto" | "preferred" | "not-preferred";
  launch_handler?: { client_mode: string | string[] };
};

export default function manifest(): ManifestMeLidhje {
  return {
    id: "/",
    handle_links: "preferred",
    launch_handler: { client_mode: ["navigate-existing", "auto"] },
    name: "TelefoniGati",
    short_name: "TelefoniGati",
    description: "Statusi i riparimit të telefonit; lexohet edhe pa internet.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f2f2f7",
    theme_color: "#f2f2f7",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // Android e pret ikonën sipas formës së telefonit (rreth, squircle); shenja është brenda zonës së sigurt.
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
