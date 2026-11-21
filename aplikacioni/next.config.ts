import type { NextConfig } from "next";

// Kokat e sigurisë për çdo faqe.
// no-referrer: kodi privat i linkut /r/… nuk u dërgohet faqeve të tjera kur klienti klikon një lidhje.
const koka = [
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: koka }];
  },
};

export default nextConfig;
