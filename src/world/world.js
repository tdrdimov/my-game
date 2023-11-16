import * as THREE from 'three'
import { CharacterController } from '../controllers/CharacterController'
import { Camera } from './camera'
import { Lights } from './lights'
import { Floor } from './floor'
import { Canvas } from './canvas'
import { CannonWorld } from './cannonWorld'
import { Walls } from './walls'
import { Torch } from './torch'
import { Target } from './target'
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
    this.target = new Target({
      scene: this._scene,
      world: this.cannonWorld._world,
    });
    this._LoadAnimatedModel()

    this.torch1 = new Torch(this._scene, new THREE.Vector3(50, -4, 0))
    // this.torch2 = new Torch(this._scene, new THREE.Vector3(-100, -4, 0))
    // this.torch3 = new Torch(this._scene, new THREE.Vector3(100, -4, 0))

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
      this.target.update()
      // this.torch1.updateAnimation(this._previousRAF)
      // this.torch2.updateAnimation(this._previousRAF)
      // this.torch3.updateAnimation(this._previousRAF)
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
