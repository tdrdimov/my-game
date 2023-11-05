import * as THREE from 'three'
import { CharacterController } from '../controllers/CharacterController'
import BoxGenerator from '../generators/BoxGenerator'
import { Camera } from './camera'
import { Lights } from './lights'
import { Floor } from './floor'
import { Canvas } from './canvas'
import { CannonWorld } from './cannonWorld'

export class World {
  constructor() {
    this._Initialize()
  }

  _Initialize() {
    this._mixers = []
    this._previousRAF = null
    this.cannonWorld = new CannonWorld()
    this._camera = new Camera().camera
    this.canvas = new Canvas(this._camera)
    this._scene = new THREE.Scene()
    new Lights(this._scene)
    this.floor = new Floor(this._scene, this.cannonWorld)
    this.boxGenerator = new BoxGenerator(this._scene, this.cannonWorld)

    // Create boxes using the box generator
    this.boxGenerator.createBox(0, 13, 0)
    this.boxGenerator.createBox(20, 20, 0)
    this.boxGenerator.createBox(40, 20, 0)

    this._LoadAnimatedModel()
    this._RAF()
  }

  _LoadAnimatedModel() {
    const params = {
      camera: this._camera,
      scene: this._scene,
      renderer: this.canvas._threejs,
      cannon: this.cannonWorld
    }
    this._controls = new CharacterController(params)
  }

  _RAF() {
    requestAnimationFrame((t) => {
      if (this._previousRAF === null) {
        this._previousRAF = t
      }

      this._RAF()

      this.canvas._threejs.render(this._scene, this._camera)
      this._Step(t - this._previousRAF)
      this._previousRAF = t

      this.cannonWorld._world.step(1 / 60, this._previousRAF, 3)
      this.boxGenerator.update()
    })
  }

  _Step(timeElapsed) {
    const timeElapsedS = timeElapsed * 0.001
    if (this._mixers) {
      this._mixers.map((m) => m.update(timeElapsedS))
    }

    if (this._controls) {
      this._controls.Update(timeElapsedS)
    }
  }
}
