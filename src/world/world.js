import * as THREE from 'three'
import CannonDebugger from 'cannon-es-debugger'
import { CharacterController } from '../controllers/CharacterController'
import { Camera } from './camera'
import { Lights } from './lights'
import { Floor } from './floor'
import { Canvas } from './canvas'
import { Walls } from './walls'
import { Torch } from './torch'
import { Sky } from './sky'
import { Fence } from './fence'
import AudioController from '../controllers/AudioController'

export class World {
  constructor(socket, scene, world) {
    this.socket = socket
    this._scene = scene
    this.cannonWorld = world
    this.players = new Map()
    this.playerHealths = {}
    this.isUiVisible = true
    this._Initialize()
  }

  _Initialize() {
    this._previousRAF = null
    this._camera = new Camera().camera
    this._camera.position.set(0, 120, -120)
    this.audioController = new AudioController({
      camera: this._camera,
      scene: this._scene
    })
    // Make the camera look at the center of the scene
    this._camera.lookAt(new THREE.Vector3(0, -80, 0))
    this._scene.add(this._camera)
    this.canvas = new Canvas(this._camera)
    new Lights(this._scene)
    this.sky = new Sky(this._scene)
    this.floor = new Floor(this._scene, this.cannonWorld)
    this.underfloor = new Floor(
      this._scene,
      this.cannonWorld,
      new THREE.Vector3(0, -100, 0),
      700,
      700,
      true
    )
    this.walls = new Walls(this._scene, this.cannonWorld)
    this.fence1 = new Fence(
      this._scene,
      './models/fence.fbx',
      Math.PI - 0.06,
      new THREE.Vector3(88, 2, -11)
    )
    this.fence2 = new Fence(
      this._scene,
      './models/fence.fbx',
      (Math.PI - 0.01) * 2,
      new THREE.Vector3(-88, 2, 11)
    )
    this.fence3 = new Fence(
      this._scene,
      './models/fence.fbx',
      -Math.PI / 2,
      new THREE.Vector3(11, 2, 88)
    )
    this.fence4 = new Fence(
      this._scene,
      './models/fence.fbx',
      Math.PI / 2,
      new THREE.Vector3(-11, 2, -88)
    )
    this.cannonDebugger = new CannonDebugger(this._scene, this.cannonWorld._world, {})

    this.torch1 = new Torch(this._scene, new THREE.Vector3(-65, 0, 65), Math.PI * -1.2, {
      x: 8,
      z: 12
    })
    this.torch2 = new Torch(this._scene, new THREE.Vector3(65, 0, 65), Math.PI * 1.2, {
      x: -8,
      z: 12
    })
    this.torch3 = new Torch(this._scene, new THREE.Vector3(65, 0, -65), Math.PI * 1.8, {
      x: -8,
      z: -6
    })
    this.torch2 = new Torch(this._scene, new THREE.Vector3(-65, 0, -65), Math.PI * -1.8, {
      x: 8,
      z: -6
    })

    this.socket.on('player-joined', (playerId, playerData) => {
      this.playerHealths[playerId] = 100
      this._LoadAnimatedModel(playerId, playerData)
    })

    this.socket.on('current-players', (players) => {
      players.forEach(([playerId, playerPosition]) => {
        this.playerHealths[playerId] = 100
        if (playerId !== this.socket.id) {
          document.getElementById('waiting_room').style.display = 'flex'
          this._LoadAnimatedModel(playerId, playerPosition)
        }
      })
    })

    this.socket.on('player-moved', (playerId, newState) => {
      if (this.players.has(playerId)) {
        this.players.get(playerId).updateState(newState)
      }
    })

    this.socket.on('player-moving', (playerId, newState) => {
      if (this.players.has(playerId)) {
        this.players.get(playerId).updateHealth(newState)
      }
    })

    this.socket.on('waiting-for-second-player', () => {
      document.getElementById('waiting_room').style.display = 'flex'
      this.isUiVisible = true
    })

    this.socket.on('start-game', () => {
      document.getElementById('waiting_room').style.display = 'none'
      this.isUiVisible = false
      document.getElementById('spell_bar').style.display = 'flex'
    })

    this.socket.on('end-game', (playerData) => {
      const winner = this.players.get(playerData.winner)
      document.getElementById('end_game').style.display = 'flex'
      document.getElementById('end_game_winner').innerHTML = `${winner.name} Wins!`
      document.getElementById('app').style.userSelect = 'none'
    })

    document.getElementById('restart_game').addEventListener('click', (event) => {
      event.preventDefault()
      const queryString = window.location.search
      const urlParams = new URLSearchParams(queryString)
      const player = this.players.get(this.socket.id)
      const room = urlParams.get('room')
      localStorage.setItem('playerName', player.name)
      localStorage.setItem('room', room)
      location.reload()
  })

    this._RAF()
  }

  _LoadAnimatedModel(playerId, playerData) {
    if (!this.players.has(playerId)) {
      const params = {
        camera: this._camera,
        scene: this._scene,
        renderer: this.canvas._threejs,
        cannon: this.cannonWorld,
        playerId: playerId,
        socket: this.socket,
        playerHealths: this.playerHealths,
        playerPosition: playerData,
        playerName: playerData.playerName,
        wizardColor: playerData.wizardColor,
        audioController: this.audioController
      }

      const player = new CharacterController(params)
      player.name = playerData.playerName
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

      if (!this.isUiVisible) {
        for (const [playerId, controller] of this.players) {
          controller.Update(t, timeElapsedS)
        }
      }

      this._previousRAF = t

      this.canvas._threejs.render(this._scene, this._camera)
      this.cannonWorld._world.step(1 / 60, this._previousRAF, 3)
      this.sky.Update(timeElapsedS)
      // this.cannonDebugger.update()
      this._RAF()
    })
  }
}
