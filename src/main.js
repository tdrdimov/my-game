import { World } from './world/world.js'
import SocketClient from './sockets/SocketClient'
import * as THREE from 'three'
import { CannonWorld } from './world/cannonWorld'

let _APP = null
let _SOCKET = null

window.addEventListener('DOMContentLoaded', () => {
    const scene = new THREE.Scene()
    const fogColor = 0xfec3aba8
    const fogNear = 200
    const fogFar = 500

    scene.fog = new THREE.Fog(fogColor, fogNear, fogFar)

    const cannonWorld = new CannonWorld()
    _SOCKET = new SocketClient(scene, cannonWorld)
    _APP = new World(_SOCKET.getSocket(), scene, cannonWorld)
})
