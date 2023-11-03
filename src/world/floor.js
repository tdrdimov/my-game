// Lights.js
import * as THREE from 'three';

export class Floor {
  constructor(scene) {
    this._scene = scene;
    this._CreateFloor();
  }

  _CreateFloor() {
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200, 20, 20),
      new THREE.MeshStandardMaterial({
        color: 0x808080
      })
    )
    plane.castShadow = false
    plane.receiveShadow = true
    plane.rotation.x = -Math.PI / 2
    this._scene.add(plane)
  }
}
