import type { NextConfig } from "next";

// Kokat e sigurisë për çdo faqe.
// no-referrer: kodi privat i linkut /r/… nuk u dërgohet faqeve të tjera kur klienti klikon një lidhje.
const koka = [
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
  // CSP: faqja ngarkon skripte, stile dhe lidhje vetëm nga vetja. Fotot mund të jenë data: ose blob:
  // (pamja paraprake e kamerës). 'unsafe-inline' për skriptet e brendshme që Next.js shton në faqe.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self'",
      "media-src 'self' blob:",
      "worker-src 'self'",
      "manifest-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self' https://accounts.google.com",
      "object-src 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: koka }];
  },
};

export default nextConfig;
