// Lights.js
import * as THREE from 'three';

export class Lights {
  constructor(scene) {
    this._scene = scene;
    this._CreateLights();
  }

  _CreateLights() {
    let light = new THREE.AmbientLight(0xe3d4fe, 1.25)
    this._scene.add(light)
  }
}
