import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";

// Lokalisht testet lexojnë DATABASE_URL dhe NEXTAUTH_SECRET nga .env.local; në CI vijnë nga sekretet.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const PORTI = 3100;

export default defineConfig({
  testDir: "tests",
  fullyParallel: false, // testet ndajnë të njëjtën databazë prove
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: `http://localhost:${PORTI}`,
    ...devices["Pixel 7"],
    // Lokalisht mund të përdoret një Chromium tashmë i instaluar.
    launchOptions: process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {},
    trace: "retain-on-failure",
  },
  webServer: {
    command: `npm run start -- -p ${PORTI}`,
    url: `http://localhost:${PORTI}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
