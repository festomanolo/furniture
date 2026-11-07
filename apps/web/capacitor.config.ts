import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "tz.samani.app",
  appName: "SAMANI",
  webDir: "dist",
  plugins: {
    SplashScreen: { launchShowDuration: 900, backgroundColor: "#153D2C", showSpinner: false },
    StatusBar: { style: "LIGHT", backgroundColor: "#F5F5F0", overlaysWebView: false },
  },
};

export default config;
