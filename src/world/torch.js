import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'

export class Torch {
  constructor(scene, position, rotation, lightOffset) {
    this._scene = scene
    this.spotLight = new THREE.SpotLight(0xf7a999, 400)
    this.pointLight = new THREE.PointLight(0xff8269, 1, 100, 2)
    this._position = position
    this._rotation = rotation
    this.lightOffset = lightOffset
    this.lantern = null
    this._LoadModel()
  }

  _LoadModel() {
    const loader = new FBXLoader()

    // Load FBX model
    loader.load(
      '../models/torch.fbx',
      (fbx) => {
        fbx.position.copy(this._position)
        fbx.scale.set(3, 3, 3)
        fbx.rotation.y = this._rotation
        this.lantern = fbx.children[0].children[0].children[4].children[0]
        this._CreateLight()
        this._CreateLanternGlow()
        this._scene.add(fbx)
      },
      (xhr) => {
        // console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
      },
      (error) => {
        console.error('Error loading FBX model:', error)
      }
    )
  }

  positionLight(position) {
    this.pointLight.position.z = position
  }

  _CreateLight() {
    const helper = new THREE.SpotLightHelper(this.spotLight, 0xffffff)
    // this._scene.add(helper)
    this.spotLight.position.set(
      this._position.x + this.lightOffset.x,
      26,
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

  _CreateLanternGlow() {
    this.pointLight.position.copy(
      this._position.x + this.lightOffset.x,
      40,
      this._position.z - this.lightOffset.z
    )
    this._scene.add(this.pointLight)

    if (this.lantern.material instanceof THREE.MeshPhongMaterial) {
      // Adjust the emissive color to create a glow effect
      this.lantern.material.emissive = new THREE.Color(0xf7a999);
      this.lantern.material.emissiveIntensity = 0.6; // Adjust the intensity as needed
  }
  }
}
