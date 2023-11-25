// server/vitePlugin.js
import { createRequire } from 'module';
const requireCommonJS = createRequire(import.meta.url);
const SocketIO = requireCommonJS('./SocketIO');

export default {
  name: 'socket-io-plugin', // A unique name for the plugin
  configureServer(server) {
    const socketIOPlugin = new SocketIO();
    socketIOPlugin.configureServer({ httpServer: server.httpServer });
  },
};
