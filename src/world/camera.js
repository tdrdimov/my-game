import * as THREE from 'three';

export class Camera {
  constructor() {
    this._camera = this._CreateCamera();
  }

  _CreateCamera() {
    const fov = 60;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 1.0;
    const far = 1000.0;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 20, 20);
    return camera;
  }

  get camera() {
    return this._camera;
  }
}
