import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The admin panel is deployed as a static SPA. All client-side routing
// is handled by React; Vite outputs index.html + hashed assets.
export default defineConfig({
  plugins: [react()],
  base: "/admin/",
});
