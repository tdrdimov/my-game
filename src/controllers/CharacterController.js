import * as THREE from 'three'
import CharacterControllerInput from '../inputs/CharacterControllerInput.js'
import { CharacterFSM } from '../states/StateMachine.js'
import { AnimationsProxy } from '../loaders/AnimationsProxy.js'
import { FBXLoaderUtil } from '../loaders/FBXLoaderUtil.js'
import * as CANNON from 'cannon-es'

export class CharacterController {
  constructor(params) {
    this._Init(params)
  }

  async _Init(params) {
    this._params = params
    this._world = this._params.cannon._world
    this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0)
    this._acceleration = new THREE.Vector3(1, 0.25, 200.0)
    this._velocity = new THREE.Vector3(0, 0, 0)

    this._animations = {}
    this._input = new CharacterControllerInput()
    this._stateMachine = new CharacterFSM(new AnimationsProxy(this._animations))

    this.FBXLoaderUtil = new FBXLoaderUtil(this._stateMachine, this._params, this._animations)
    const modelData = await this.loadCharacter()
    this._target = modelData.target
    this._mixer = modelData.mixer
    this._stateMachine = modelData.stateMachine
    this.cameraController = modelData.cameraController
    
    // Cannon.js body
    const targetSize = 2
    const shape = new CANNON.Box(new CANNON.Vec3(targetSize * 0.5, targetSize * 0.5, targetSize * 0.5))

    this.body = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(0, 3, 0),
      shape: shape,
      material: this._target.children[0].material
    })
    this.body.position.copy(this._target.position)
    this.body.addEventListener('collide', this.onColide)
    this._world.addBody(this.body)
  }

  onColide(firstImpact) {
    // console.log(firstImpact)
  }

  async loadCharacter() {
    try {
      return await this.FBXLoaderUtil.loadModels()
    } catch (error) {
      console.error('Error loading models:', error)
    }
  }

  Update(timeInSeconds) {
    if (!this._target) {
      return
    }

    this._stateMachine.Update(timeInSeconds, this._input)

    const velocity = this._velocity

    // update camera
    this.cameraController.Update(timeInSeconds)

    const frameDecceleration = new THREE.Vector3(
      velocity.x * this._decceleration.x,
      velocity.y * this._decceleration.y,
      velocity.z * this._decceleration.z
    )
    frameDecceleration.multiplyScalar(timeInSeconds)
    frameDecceleration.z =
      Math.sign(frameDecceleration.z) *
      Math.min(Math.abs(frameDecceleration.z), Math.abs(velocity.z))

    velocity.add(frameDecceleration)

    const controlObject = this._target
    const _Q = new THREE.Quaternion()
    const _A = new THREE.Vector3()
    const _R = controlObject.quaternion.clone()

    const acc = this._acceleration.clone()
    if (this._input._keys.shift) {
      acc.multiplyScalar(2.0)
    }

    if (this._stateMachine?._currentState?.Name == 'jump') {
      acc.multiplyScalar(1.0)
    }

    if (this._input._keys.forward) {
      velocity.z += acc.z * timeInSeconds
    }
    if (this._input._keys.backward) {
      velocity.z -= (acc.z - 150) * timeInSeconds
    }
    if (this._input._keys.left) {
      _A.set(0, 1, 0)
      _Q.setFromAxisAngle(_A, 6.0 * Math.PI * timeInSeconds * this._acceleration.y)
      _R.multiply(_Q)
    }
    if (this._input._keys.right) {
      _A.set(0, 1, 0)
      _Q.setFromAxisAngle(_A, 6.0 * -Math.PI * timeInSeconds * this._acceleration.y)
      _R.multiply(_Q)
    }

    controlObject.quaternion.copy(_R)

    const oldPosition = new THREE.Vector3()
    oldPosition.copy(controlObject.position)

    const forward = new THREE.Vector3(0, 0, 1)
    forward.applyQuaternion(controlObject.quaternion)
    forward.normalize()

    const sideways = new THREE.Vector3(1, 0, 0)
    sideways.applyQuaternion(controlObject.quaternion)
    sideways.normalize()

    sideways.multiplyScalar(velocity.x * timeInSeconds)
    forward.multiplyScalar(velocity.z * timeInSeconds)

    controlObject.position.add(forward)
    controlObject.position.add(sideways)
    // controlObject.position.copy(this.body.position)

    oldPosition.copy(controlObject.position)

    this.body.position.copy(controlObject.position)
    this.body.quaternion.copy(controlObject.quaternion)

    if (this._mixer) {
      this._mixer.update(timeInSeconds)
    }
  }
}
