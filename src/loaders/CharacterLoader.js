import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import CameraFollowController from '../controllers/CameraController.js'

export class CharacterLoader {
  constructor(_stateMachine, params, animations, entityManager) {
    this.loader = new FBXLoader()
    this.modelsPath = '/models/'
    this.animationsPath = '/animations/'
    this._stateMachine = _stateMachine
    this._params = params
    this._animations = animations
    this._target = null
    this.cameraController = {}
    this._mixer = null
    this.entityManager = entityManager
  }

  async loadModels() {
    return new Promise((resolve, reject) => {
      this.loader.setPath(this.modelsPath)
      this.loader.load('wizTRig.fbx', (fbx) => {
        fbx.name = 'character'
        fbx.traverse((c) => {
          c.castShadow = true
        })

        this._target = fbx
        this._target.matrixAutoUpdate = false

        this._target.position.set(0, 0, 0)
        this._params.scene.add(this._target)

        this.cameraController = new CameraFollowController(
          this._params.camera,
          this._target,
          this._params.renderer,
          this.entityManager
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
          'BreathingIdle.fbx': 'idle',
          'Jump.fbx': 'jump',
          'Standing_2H_Magic_Attack_01.fbx': 'magic1',
          'Idle.fbx': 'idleWait',
          'death.fbx': 'death',
          'ReceiveDmg.fbx': 'receiveDmg',
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
