import * as THREE from 'three'
import CharacterControllerInput from '../inputs/CharacterControllerInput.js'
import { CharacterFSM } from '../states/StateMachine.js'
import { AnimationsProxy } from '../loaders/AnimationsProxy.js'
import { CharacterLoader } from '../loaders/CharacterLoader.js'
import * as CANNON from 'cannon-es'
import * as YUKA from 'yuka'
import { ShootSpell } from '../generators/ShootSpell.js'

export class CharacterController {
  constructor(params) {
    this.playerId = params.playerId
    this._Init(params)
  }

  async _Init(params) {
    this._params = params
    this._world = this._params.cannon._world
    this.raycaster = new THREE.Raycaster()
    this._animations = {}
    this.vehicle = new YUKA.Vehicle()
    this.time = new YUKA.Time()
    this.entity = new YUKA.GameEntity()
    this.entity.position.set(0, 0, 0)
    this.entity.id = this.playerId
    this._input = new CharacterControllerInput(
      this._params.socket,
      this._params.playerId
    )
    this.entityManager = new YUKA.EntityManager()
    this._stateMachine = new CharacterFSM(
      new AnimationsProxy(this._animations),
      this.entity,
      this.vehicle
    )
    this.CharacterLoader = new CharacterLoader(
      this._stateMachine,
      this._params,
      this._animations,
      this.entityManager
    )
    this.fbxModel = await this.loadCharacter()
    this._target = this.fbxModel.target
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
      this.handleMouseClick(event)
    })

    let isMouseButtonDown = false

    window.addEventListener('mousedown', (event) => {
      isMouseButtonDown = true
      this.handleMouseClick(event)
    })

    window.addEventListener('mouseup', () => {
      isMouseButtonDown = false
    })

    // Continuously update the target position while the mouse button is held
    window.addEventListener('mousemove', (event) => {
      if (isMouseButtonDown && this._target) {
        this.handleMouseClick(event)
      }
    })

    // Cannon.js body
    const targetSize = 2
    const shape = new CANNON.Box(
      new CANNON.Vec3(targetSize * 0.5, targetSize * 0.5, targetSize * 0.5)
    )

    this.body = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(0, 0, 0),
      shape: shape,
      material: this._target.children[0].material
    })

    // YUKA vehicle configuration
    this.vehicle.setRenderComponent(this._target, this.sync)
    this.vehicle.position.set(0, 0, 0)
    this.vehicle.maxSpeed = 50
    this.vehicle.mass = 0.1
    this.vehicle.scale.set(0.05, 0.05, 0.05)

    const arriveBehavior = new YUKA.ArriveBehavior(this.entity.position)
    arriveBehavior.deceleration = 0.2
    arriveBehavior.tolerance = 1
    this.vehicle.steering.add(arriveBehavior)

    this.entityManager.add(this.vehicle)

    this.body.position.copy(this._target.position)
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
  }

  onColide(event) {
    // console.log('collision', event)
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
    this.entity.position.copy(newState)
  }

  handleMouseClick(event) {
    if (!this._target || this._params.socket.id !== this._params.playerId) {
      return
    }

    // When the player moves
    this._params.socket.emit('player-moved', this._params.playerId, this.entity.position)

    const mousePosition = new THREE.Vector2()
    mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1
    mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1

    this.raycaster.setFromCamera(mousePosition, this._params.camera)
    const floorMesh = this._params.scene.getObjectByName('floor')
    const intersects = this.raycaster.intersectObjects([floorMesh])

    if (intersects.length) {
      for (let i = 0; i < intersects.length; i++) {
        this.entity.position.copy(intersects[i].point)
      }
    }

    if (!this.indicator) {
      this.indicator = new THREE.Mesh(this.indicatorGeometry, this.indicatorMaterial)
      this._params.scene.add(this.indicator)
    }

    if (intersects.length) {
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

    if (this._input._keys.space) {
      this.vehicle.maxSpeed = 100
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

    // trigger walking animation
    if (this.vehicle.velocity.length() > 0.1) {
      this._input._keys.forward = true
    } else {
      this._input._keys.forward = false
    }

    // update camera
    if (this._params.socket.id === this._params.playerId) {
      this.cameraController.Update(timeInSeconds)
    }

    this.shootSpell.cast(timeInSeconds)

    // update animations
    if (this._mixer) {
      this._mixer.update(timeInSeconds)
    }
  }
}
