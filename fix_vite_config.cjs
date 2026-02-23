const fs = require('fs');
const content = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
`;

// Write using a Buffer to ensure pure UTF-8 with no BOM
const buf = Buffer.from(content, 'utf8');
fs.writeFileSync('vite.config.ts', buf);
console.log('Written', buf.length, 'bytes');
console.log('First 6 bytes hex:', buf.slice(0, 6).toString('hex'));
console.log('Content preview:', content.substring(0, 100));
