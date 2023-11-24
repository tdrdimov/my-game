import * as THREE from 'three'

export class Sky {
  constructor(scene) {
    this._scene = scene
    this._Initialize()
  }

  _Initialize() {
    const skyGeometry = new THREE.SphereGeometry(500, 60, 40)
    // Load a sky texture
    const textureLoader = new THREE.TextureLoader()
    textureLoader.load('background.jpg', (texture) => {
      // Create a material with the sky texture
      const skyMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide
      })
      // Create a mesh with the sky geometry and material
      const skyMesh = new THREE.Mesh(skyGeometry, skyMaterial)
      // Add the sky mesh to the scene
      this._scene.add(skyMesh)
    })
  }
}