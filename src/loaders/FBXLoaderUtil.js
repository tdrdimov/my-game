import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import CameraFollowController from '../controllers/CameraController.js'

export class FBXLoaderUtil {
  constructor(_stateMachine, params, animations) {
    this.loader = new FBXLoader()
    this.modelsPath = '../models/'
    this.animationsPath = '../animations/'
    this._stateMachine = _stateMachine
    this._params = params
    this._animations = animations
    this._target = null
    this.cameraController = {}
    this._mixer = null
  }

  async loadModels() {
    return new Promise((resolve, reject) => {
      this.loader.setPath(this.modelsPath)
      this.loader.load('michelle.fbx', (fbx) => {
        fbx.scale.setScalar(0.1)
        fbx.traverse((c) => {
          c.castShadow = true
        })

        this._target = fbx
        // this._target.position.set(0, 20, 0)
        this._params.scene.add(this._target)

        this.cameraController = new CameraFollowController(
          this._params.camera,
          this._target,
          this._params.renderer
        )

        this._mixer = new THREE.AnimationMixer(this._target)

        const _OnLoad = (animName, anim) => {
          const clip = anim.animations[0]
          const action = this._mixer.clipAction(clip)

          this._animations[animName] = {
            clip: clip,
            action: action
          }
        }

        const loader = new FBXLoader()
        loader.setPath(this.animationsPath)

        const animationFiles = {
          'Walk.fbx': 'walk',
          'Run.fbx': 'run',
          'BreathingIdle.fbx': 'idle',
          'Jump.fbx': 'jump',
          'Backward.fbx': 'walk_back',
          'Idle.fbx': 'idleWait',
          'LeftTurn.fbx': 'left',
          'RightTurn.fbx': 'right'
        }

        const loadPromises = []

        for (const [animationFile, animationName] of Object.entries(animationFiles)) {
          const loadPromise = loader.loadAsync(animationFile).then((a) => _OnLoad(animationName, a))
          loadPromises.push(loadPromise)
        }

        Promise.all(loadPromises).then(() => {
          this._stateMachine.SetState('idle')
          resolve({
            stateMachine: this._stateMachine,
            target: this._target,
            mixer: this._mixer,
            cameraController: this.cameraController
          })
        })
      })
    })
  }
}
