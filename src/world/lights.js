// Lights.js
import * as THREE from 'three'

export class Lights {
  constructor(scene) {
    this._scene = scene
    this._CreateLights()
  }

  _CreateLights() {
    const ambient = new THREE.AmbientLight(0xe3d4fe, 3)
    const directional = new THREE.DirectionalLight(0x333333, 2)
    directional.position.set(0, 1, 1).normalize()
    this._scene.add(ambient, directional)
  }
}
