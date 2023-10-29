import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { AnimationMixer, LoopOnce, LoopRepeat, LoopPingPong, DirectionalLight } from 'three'
import * as THREE from 'three'

export class GLTFLoaderClass {
  constructor(scene) {
    this.scene = scene
    this.gltfModel = null
    this.loader = new GLTFLoader()
    this.mixer = null
    this.animations = []
  }

  async loadGLTFModel(modelPath) {
    try {
      const gltf = await new Promise((resolve, reject) => {
        this.loader.load(
          modelPath,
          (gltf) => {
            resolve(gltf)
          },
          undefined,
          reject
        )
      })

      this.gltfModel = gltf.scene

      this.scene.add(this.gltfModel)

      const directionalLight = new DirectionalLight(0xffffff, 1)
      directionalLight.position.set(
        this.gltfModel.position.x,
        this.gltfModel.position.y + 10,
        this.gltfModel.position.z + 10
      )
      this.scene.add(directionalLight)
      this.mixer = new AnimationMixer(this.gltfModel)
      this.animations = gltf.animations
    } catch (error) {
      console.error('Error loading GLTF model:', error)
    }
  }

  update(deltaTime) {
    if (this.mixer) {
      this.mixer.update(deltaTime)
    }
  }

  playAnimation(animationName) {
    if (this.mixer) {
      const animation = this.animations.find((anim) => anim.name === animationName)
      const clip = this.mixer.clipAction(animation)
      if (clip) {
        clip.setLoop(LoopRepeat)
        clip.clampWhenFinished = true
        clip.play()
      }
    }
  }
}
