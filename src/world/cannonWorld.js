import * as CANNON from 'cannon-es'
export class CannonWorld {
  constructor() {
    this._Initialize()
  }

  _Initialize() { 
    this._world = new CANNON.World()
    this._world.gravity.set(0, -9.82, 0)
    this._world.broadphase = new CANNON.NaiveBroadphase()
    this._world.solver.iterations = 40
    this._world.allowSleep = true
    this._world.defaultMaterial = new CANNON.Material('default')
    this._world.defaultContactMaterial = new CANNON.ContactMaterial(
      this._world.defaultMaterial,
      this._world.defaultMaterial,
      {
        friction: 0.1,
        restitution: 0.7
      }
    )
    return this._world
  }
}