import * as THREE from 'three'
import { BasicCharacterController } from '../controllers/CharacterController'
import BoxGenerator from '../generators/BoxGenerator'
import { Camera } from './camera'
import { Lights } from './lights'
import { Floor } from './floor'
import { Canvas } from './canvas'

export class World {
  constructor() {
    this._Initialize()
  }

  _Initialize() {
    this._mixers = []
    this._previousRAF = null
    this.canvas = new Canvas()
    this._camera = new Camera().camera
    this._scene = new THREE.Scene()
    new Lights(this._scene)
    this.floor = new Floor(this._scene)
    this.boxGenerator = new BoxGenerator(this._scene)

    // Create boxes using the box generator
    this.boxGenerator.createBox(0, 0, 0)
    this.boxGenerator.createBox(20, 0, 0)
    this.boxGenerator.createBox(40, 0, 0)

    this._LoadAnimatedModel()
    this._RAF()
  }

  _LoadAnimatedModel() {
    const params = {
      camera: this._camera,
      scene: this._scene
    }
    this._controls = new BasicCharacterController(params)
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
