import { World } from './world/world.js'
import SocketClient from './sockets/SocketClient';

let _APP = null
let _SOCKET = null

window.addEventListener('DOMContentLoaded', () => {
  _APP = new World()
  _SOCKET = new SocketClient();
})
