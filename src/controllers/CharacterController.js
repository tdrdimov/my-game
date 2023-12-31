import * as THREE from 'three'
import CharacterControllerInput from '../inputs/CharacterControllerInput.js'
import { CharacterFSM } from '../states/StateMachine.js'
import { AnimationsProxy } from '../loaders/AnimationsProxy.js'
import { CharacterLoader } from '../loaders/CharacterLoader.js'
import * as CANNON from 'cannon-es'
import Nebula, { SpriteRenderer } from 'three-nebula'
import * as YUKA from 'yuka'
import { ShootSpell } from '../generators/ShootSpell.js'
import HealthBar from './HealthBar'
import slash from '../generators/slash.json'

export class CharacterController {
  constructor(params) {
    this.playerId = params.playerId
    this._Init(params)
    this.onColide = this.onColide.bind(this)
  }

  async _Init(params) {
    this.nebula = null
    this.emitter = null
    this._params = params
    this._world = this._params.cannon._world
    this.raycaster = new THREE.Raycaster()
    this._animations = {}
    this.damage = 20
    this.vehicle = new YUKA.Vehicle()
    this.time = new YUKA.Time()
    this.entity = new YUKA.GameEntity()
    this.entity.position.set(this._params.playerPosition.position.x, 0, 0)
    this.healthBar = new HealthBar(
      this._params.scene,
      100,
      this.entity,
      this._params.camera,
      this._params.playerName
    )
    this._input = new CharacterControllerInput(
      this._params.socket,
      this._params.playerId,
      this._params.playerHealths,
      this._params.audioController
    )
    this.entityManager = new YUKA.EntityManager()
    this._stateMachine = new CharacterFSM(
      new AnimationsProxy(this._animations),
      this.entity,
      this.vehicle,
      this._params.camera,
      this._params.scene,
      this._params.audioController,
    )
    this.CharacterLoader = new CharacterLoader(
      this._stateMachine,
      this._params,
      this._animations,
      this.entityManager
    )
    this.fbxModel = await this.loadCharacter()
    this._target = this.fbxModel.target
    this._target.position.set(this._params.playerPosition.position.x, 0, 0)
    this._mixer = this.fbxModel.mixer
    this._stateMachine = this.fbxModel.stateMachine
    this.cameraController = this.fbxModel.cameraController
    this.indicator = null
    this.indicatorGeometry = new THREE.ConeGeometry(4, 2, 12)
    this.indicatorMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.2
    })

    // Add event listeners for mouse click
    window.addEventListener('click', (event) => {
      this.moveCharacterToMouse(event)
    })

    let isMouseButtonDown = false

    window.addEventListener('mousedown', (event) => {
      isMouseButtonDown = true
      this.moveCharacterToMouse(event)
    })

    window.addEventListener('mouseup', () => {
      isMouseButtonDown = false
    })

    // Continuously update the target position while the mouse button is held
    window.addEventListener('mousemove', (event) => {
      if (isMouseButtonDown && this._target) {
        this.moveCharacterToMouse(event, isMouseButtonDown)
      }
      this.rotatePlayer(event)
    })

    const size = 20
    // Cannon.js body
    const shape = new CANNON.Box(new CANNON.Vec3(2.5, size, 2.5))

    this.body = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(this._params.playerPosition.position.x, 0, 0),
      shape: shape,
      type: CANNON.Body.KINEMATIC,
      material: this._target.children[0].material
    })

    // YUKA vehicle configuration
    this.vehicle.setRenderComponent(this._target, this.sync)
    this.vehicle.position.set(this._params.playerPosition.position.x, 0, 0)
    this.vehicle.maxSpeed = 50
    this.vehicle.mass = 0.1
    this.vehicle.scale.set(0.1, 0.1, 0.1)

    const arriveBehavior = new YUKA.ArriveBehavior(this.entity.position)
    arriveBehavior.deceleration = 0.2
    arriveBehavior.tolerance = 1
    this.vehicle.steering.add(arriveBehavior)

    this.entityManager.add(this.vehicle)

    this.body.position.copy(this._target.position)
    this.body.id = `player_${this._params.socket.id}`
    this.body.addEventListener('collide', this.onColide)
    this._world.addBody(this.body)

    this.shootSpell = new ShootSpell({
      input: this._input,
      scene: this._params.scene,
      cannon: this._params.cannon,
      body: this.body,
      entityManager: this.entityManager,
      vehicle: this.vehicle,
      socket: this._params.socket,
      playerId: this.playerId
    })

    this._params.socket.on('shoot-spell', (playerId, spellInfo) => {
      if (this.playerId === playerId) {
        this._stateMachine.SetState('magic1')
      }
    })

    this._params.socket.on('player-jump', (playerId) => {
      // Start the jump animation
      if (this.playerId === playerId) {
        this._stateMachine.SetState('jump')
      }
    })

    this._params.socket.on('receive-damage', (playerId, playerData) => {
      if (this.playerId === playerId) {
        this._params.playerHealths[playerId] -= this.damage
        this.healthBar.updateHealth(this._params.playerHealths[playerId])
        this.receiveDmgParticles(playerData.position)
        this._params.audioController.play(this.body.position, '/sounds/Fireball.mp3', false)

        if (this._params.playerHealths[playerId] <= 0) {
          this._stateMachine.SetState('death')
        }
        this.announceWinner()
      }
    })
  }

  onColide(event) {
    const { body } = event
    if (typeof body.id === 'string' && body.id !== this._params.socket.id) {
      this._params.socket.emit('receive-damage', this._params.socket.id)
      this._params.playerHealths[this._params.socket.id] -= this.damage
      this.healthBar.updateHealth(this._params.playerHealths[this._params.socket.id])
      this.receiveDmgParticles()
      this._params.audioController.play(this.body.position, '/sounds/Fireball.mp3', false)
    }

    if (this._params.playerHealths[this._params.socket.id] <= 0) {
      this._stateMachine.SetState('death')
    }
    this.announceWinner()
  }

  receiveDmgParticles(position) {
    const pos = position
      ? new THREE.Vector3(position.x, position.y, position.z)
      : this.entity.position.clone()

    Nebula.fromJSONAsync(slash, THREE).then((loaded) => {
      const nebulaRenderer = new SpriteRenderer(this._params.scene, THREE)
      this.nebula = loaded.addRenderer(nebulaRenderer)
      this.emitter = this.nebula.emitters[0]
      pos.y = 15
      // debug particles to make sure they show every time
      this.emitter.position.copy(pos)
      this.nebula.update()
    })
  }

  announceWinner() {
    let loserId = null
    let winnerId = null

    Object.entries(this._params.playerHealths).forEach(([key, value]) => {
      if (value === 0) {
        loserId = key
      } else if (value > 0) {
        winnerId = key
      }
    })

    if (loserId) {
      setTimeout(() => {
        this._params.socket.emit('end-game', {
          loser: loserId,
          winner: winnerId
        })
      }, 3000)
    }
  }

  async loadCharacter() {
    try {
      return await this.CharacterLoader.loadModels()
    } catch (error) {
      console.error('Error loading models:', error)
    }
  }

  sync(entity, renderComponent) {
    renderComponent.matrix.copy(entity.worldMatrix)
  }

  updateState(newState) {
    if (newState.position) {
      this.entity.position.copy(newState.position)
    }

    if (newState.rotation) {
      this.vehicle.lookAt(newState.rotation)
    }
  }

  updateHealth(newState) {
    this.healthBar.updatePosition(newState)
  }

  rotatePlayer(event) {
    const intersects = this.mouseIntersects(event)
    if (intersects && intersects.length) {
      for (let i = 0; i < intersects.length; i++) {
        this.vehicle.lookAt(intersects[i].point)
      }
    }
  }

  mouseIntersects(event) {
    const isPlayerDead = Object.values(this._params.playerHealths).some(
      (value) => typeof value === 'number' && value <= 0
    )
    if (!this._target || this._params.socket.id !== this._params.playerId || isPlayerDead) {
      return
    }

    const mousePosition = new THREE.Vector2()
    mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1
    mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1

    this.raycaster.setFromCamera(mousePosition, this._params.camera)
    const floorMesh = this._params.scene.getObjectByName('floor')
    const intersects = this.raycaster.intersectObjects([floorMesh])

    this._params.socket.emit('player-moved', this._params.playerId, {
      position: this.entity.position,
      rotation: intersects[0]?.point,
      playerName: this._params.playerName
    })

    return intersects
  }

  moveCharacterToMouse(event) {
    const intersects = this.mouseIntersects(event)
    if (intersects && intersects.length) {
      for (let i = 0; i < intersects.length; i++) {
        this.entity.position.copy(intersects[i].point)
      }
    }

    if (!this.indicator && this._params.socket.id === this._params.playerId) {
      this.indicator = new THREE.Mesh(this.indicatorGeometry, this.indicatorMaterial)
      this._params.scene.add(this.indicator)
    }

    if (intersects && intersects.length) {
      // Set the position of the indicator to the click point
      this.indicator.position.copy(intersects[0].point)
      this.indicator.position.y = 0
    }
  }

  Update(t, timeInSeconds) {
    if (!this._target) {
      return
    }

    // update animations state machine
    this._stateMachine.Update(timeInSeconds, this._input)
    this.healthBar.updateHealth(this._params.playerHealths[this.playerId])
    if (this._input._keys.space) {
      this.vehicle.maxSpeed = 100
      this._stateMachine.SetState('jump')
      this._params.socket.emit('player-jump', this._params.playerId)
    } else {
      this.vehicle.maxSpeed = 50
    }

    // Update YUKA entities
    const delta = this.time.update().getDelta() // Use the time since the last frame as delta
    this.entityManager.update(delta)

    // update cannon.js body
    const entity = this.entityManager.entities[0]
    this.body.position.copy(entity.position)
    this.body.quaternion.copy(entity.rotation)
    this.healthBar.updatePosition(this.body.position)

    // trigger walking animation
    if (this.vehicle.velocity.length() > 0.1) {
      this._input._keys.forward = true
      this._params.socket.emit('player-moving', this._params.playerId, this.body.position)
    } else {
      this._input._keys.forward = false
    }

    // update camera
    if (this._params.socket.id === this._params.playerId) {
      this.cameraController.Update(timeInSeconds)
    }

    if (this.nebula && this.emitter) {
      const pos = entity.position.clone()
      pos.y = 15
      this.emitter.position.copy(pos)
      this.nebula.update()
    }

    this.shootSpell.cast(timeInSeconds, this.body.position)

    // update animations
    if (this._mixer) {
      this._mixer.update(timeInSeconds)
    }
  }
}
