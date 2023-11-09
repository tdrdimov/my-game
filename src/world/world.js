import * as THREE from 'three'
import { CharacterController } from '../controllers/CharacterController'
import BallGenerator from '../generators/BallGenerator'
import { Camera } from './camera'
import { Lights } from './lights'
import { Floor } from './floor'
import { Canvas } from './canvas'
import { CannonWorld } from './cannonWorld'
import { Walls } from './walls'

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
    this.walls = new Walls(this._scene, this.cannonWorld)
    this.ballGenerator = new BallGenerator(this._scene, this.cannonWorld)

    this.ballGenerator.createBall(0, 13, 10)

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
      this._Step(t, t - this._previousRAF)
      this._previousRAF = t

      this.cannonWorld._world.step(1 / 60, this._previousRAF, 3)
      this.ballGenerator.update()
    })
  }

  _Step(t, timeElapsed) {
    const timeElapsedS = timeElapsed * 0.001
    if (this._mixers) {
      this._mixers.map((m) => m.update(timeElapsedS))
    }

    if (this._controls) {
      this._controls.Update(t, timeElapsedS)
    }
  }
}
