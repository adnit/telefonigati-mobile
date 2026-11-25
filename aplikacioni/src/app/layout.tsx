import type { Metadata, Viewport } from "next";
import "./globals.css";
import Pwa from "@/components/Pwa";
import { SKRIPTI_I_TEMES } from "@/components/Tema";

export const metadata: Metadata = {
  // Adresa e plotë e faqes, që parapamja e linkut (WhatsApp, Viber) të gjejë foton.
  metadataBase: new URL(process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.NEXTAUTH_URL ?? "http://localhost:3000"),
  title: "TelefoniGati",
  openGraph: { title: "TelefoniGati · Ku është telefoni yt tani?", description: "Statusi i riparimit, kostoja shtesë dhe njoftimi kur është gati.", siteName: "TelefoniGati", locale: "sq_AL", type: "website" },
  description: "Statusi i riparimit të telefonit",
  // Faqet e riparimeve janë private: motorët e kërkimit nuk duhet t'i ruajnë.
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "TelefoniGati", statusBarStyle: "default" },
};

// Faqja shtrihet nën "notch"; përmbajtja largohet me env(safe-area-inset-*).
// Ngjyra e shiritit të statusit ndjek temën e telefonit.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f2f7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // Atributin data-theme e vendos skripti i temës para React-it; prandaj nuk krahasohet gjatë hidratimit.
    <html lang="sq" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SKRIPTI_I_TEMES }} />
      </head>
      <body><Pwa />{children}</body>
    </html>
  );
}
