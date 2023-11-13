import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'

export class Torch {
  constructor(scene, position) {
    this._scene = scene
    this._mixer = null
    this._position = position
    this._LoadModel()
    this._CreateLight()
  }

  _LoadModel() {
    const loader = new FBXLoader()

    // Load FBX model
    loader.load(
      '../models/torch.fbx',
      (fbx) => {
        this._mixer = new THREE.AnimationMixer(fbx)
        const animationClip = this._mixer.clipAction(fbx.animations[0])
        fbx.position.copy(this._position)
        fbx.scale.set(1, 1, 1)
        this._scene.add(fbx)
        animationClip.play()
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
      },
      (error) => {
        console.error('Error loading FBX model:', error)
      }
    )
  }

  _CreateLight() {
    const pointLight = new THREE.PointLight(0xffcc00, 1, 100)
    pointLight.position.copy(this._position.clone().add(new THREE.Vector3(0, 20, 0))) // Adjust light position
    this._scene.add(pointLight)
  }

  updateAnimation(deltaTime) {
    if (this._mixer) {
      this._mixer.update(deltaTime);
    }
  }
}
