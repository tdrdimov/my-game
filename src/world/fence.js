import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'

export class Fence {
  constructor(scene, fbxFilePath, rotation, position) {
    this.scene = scene
    this.rotation = rotation
    this.position = position
    this.fbxFilePath = fbxFilePath
    this.loader = new FBXLoader()
    this.loadModel()
  }

  loadModel() {
    this.loader.load(this.fbxFilePath, (fbx) => {
      fbx.scale.setScalar(3)
      fbx.rotation.y = this.rotation
      fbx.position.set(this.position.x, this.position.y, this.position.z)
      fbx.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })
      this.scene.add(fbx)
    })
  }
}
