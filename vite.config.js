// vite.config.js
import { defineConfig } from 'vite';
import createSocketIOPlugin from './server/SocketIOPlugin';

export default ({ command }) => {
  return defineConfig({
    plugins: command === 'serve' ? [createSocketIOPlugin()] : [],
    build: {
      outDir: 'dist', // Output directory for production build
    },
  });
};
