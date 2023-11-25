import * as THREE from 'three'
import CannonDebugger from 'cannon-es-debugger'
import { CharacterController } from '../controllers/CharacterController'
import { Camera } from './camera'
import { Lights } from './lights'
import { Floor } from './floor'
import { Canvas } from './canvas'
import { Walls } from './walls'
import { Torch } from './torch'
import { Target } from './target'
import { Sky } from './sky'
export class World {
  constructor(socket, scene, world) {
    this.socket = socket
    this._scene = scene
    this.cannonWorld = world
    this.players = new Map()
    this.playerHealths = {}
    this._Initialize()
  }

  _Initialize() {
    this._previousRAF = null
    this._camera = new Camera().camera
    this.canvas = new Canvas(this._camera)
    new Lights(this._scene)
    // this.sky = new Sky(this._scene)
    this.floor = new Floor(this._scene, this.cannonWorld)
    this.walls = new Walls(this._scene, this.cannonWorld)
    // this.target = new Target({
    //   scene: this._scene,
    //   world: this.cannonWorld._world
    // })
    this.cannonDebugger = new CannonDebugger(this._scene, this.cannonWorld._world, {
      // options...
    })

    this.torch1 = new Torch(this._scene, new THREE.Vector3(-95, 23, 95), Math.PI * 1.8, { x: 18, z: 12 })
    this.torch2 = new Torch(this._scene, new THREE.Vector3(95, 23, 95), Math.PI * 1.2, { x: -18, z: 12 })
    this.torch3 = new Torch(this._scene, new THREE.Vector3(95, 23, -95), Math.PI * -1.2, { x: -18, z: -12 })
    this.torch2 = new Torch(this._scene, new THREE.Vector3(-95, 23, -95), Math.PI * -1.8, { x: 18, z: -12 })
    this.socket.on('player-joined', (playerId, initialState) => {
      // console.log(`Player ${playerId} joined the room`)
      this.playerHealths[playerId] = 100
      this._LoadAnimatedModel(playerId, initialState)
    })

    this.socket.on('current-players', (players) => {
      players.forEach(([playerId, playerState]) => {
        this.playerHealths[playerId] = 100
        if (playerId !== this.socket.id) {
          this._LoadAnimatedModel(playerId, playerState)
        }
      })
    })

    this.socket.on('player-moved', (playerId, newState) => {
      // console.log(`Player ${playerId} moved`)
      if (this.players.has(playerId)) {
        this.players.get(playerId).updateState(newState)
      }
    })

    this.socket.on('player-moving', (playerId, newState) => {
      // console.log(`Player ${playerId} moved`)
      if (this.players.has(playerId)) {
        this.players.get(playerId).updateHealth(newState)
      }
    })

    this._RAF()
  }

  _LoadAnimatedModel(playerId, initialState) {
    // Check if a CharacterController instance already exists for the player
    if (!this.players.has(playerId)) {
      const params = {
        camera: this._camera,
        scene: this._scene,
        renderer: this.canvas._threejs,
        cannon: this.cannonWorld,
        playerId: playerId,
        socket: this.socket,
        initialState: initialState,
        playerHealths: this.playerHealths
      }
      const player = new CharacterController(params)
      this.players.set(playerId, player)
    }
  }

  _RAF() {
    requestAnimationFrame((t) => {
      if (this._previousRAF === null) {
        this._previousRAF = t
      }
      const timeElapsed = t - this._previousRAF
      const timeElapsedS = timeElapsed * 0.001

      // Iterate over all active players and update their controllers
      for (const [playerId, controller] of this.players) {
        controller.Update(t, timeElapsedS)
      }

      this._previousRAF = t

      this.canvas._threejs.render(this._scene, this._camera)

      this.cannonWorld._world.step(1 / 60, this._previousRAF, 3)
      this.cannonDebugger.update()
      // this.target.update()
      this._RAF()
    })
  }
}
