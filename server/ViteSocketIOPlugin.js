// server/vitePlugin.js
import { createRequire } from 'module';
const requireCommonJS = createRequire(import.meta.url);
const SocketIOPlugin = requireCommonJS('./SocketIOPlugin');

export default {
  name: 'socket-io-plugin', // A unique name for the plugin
  configureServer(server) {
    const socketIOPlugin = new SocketIOPlugin();
    socketIOPlugin.configureServer({ httpServer: server.httpServer });
  },
};
