import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
export class Torch {
  constructor(scene, position, rotation, lightOffset) {
    this._scene = scene
    this.spotLight = new THREE.SpotLight(0xf7a999, 400)
    this._position = position
    this._rotation = rotation
    this.lightOffset = lightOffset
    this.lantern = null
    this._LoadModel()
  }

  _LoadModel() {
    const loader = new GLTFLoader()

    // Load GLB model
    loader.load(
      '/models/lantern.glb',
      (gltf) => {
        const model = gltf.scene
        model.position.copy(this._position)
        model.scale.set(2.3, 2.3, 2.3)
        model.rotation.y = this._rotation
        this._scene.add(model)
        this._CreateLight()
      },
      (xhr) => {
        // console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
      },
      (error) => {
        console.error('Error loading GLB model:', error)
      }
    )
  }

  _CreateLight() {
    // const helper = new THREE.SpotLightHelper(this.spotLight, 0xffffff)
    // this._scene.add(helper)
    this.spotLight.position.set(
      this._position.x + this.lightOffset.x,
      24.5,
      this._position.z - this.lightOffset.z
    )
    this.spotLight.target.position.set(
      this._position.x + this.lightOffset.x,
      0,
      this._position.z - this.lightOffset.z
    ) // Point the light downwards
    this.spotLight.castShadow = true

    this._scene.add(this.spotLight)
    this._scene.add(this.spotLight.target)
  }
}
