import { State } from './State.js'
import * as THREE from 'three'

export class JumpState extends State {
  constructor(parent) {
    super(parent)
    this.prevState = null
    this.input = null
    this._FinishedCallback = () => {
      this._Finished()
    }
  }

  get Name() {
    return 'jump'
  }

  Enter(prevState, input) {
    this.input = input
    const curAction = this._parent._proxy._animations['jump'].action
    
    const mixer = curAction.getMixer()
    mixer.addEventListener('finished', this._FinishedCallback)
    this._parent.audioController.stop('/sounds/walking.mp3')
    this._parent.audioController.stop('/sounds/spell_cast.wav')
    if (prevState) {
      this.prevState = prevState
      const prevAction = this._parent._proxy._animations[prevState.Name].action

      curAction.reset()
      curAction.setLoop(THREE.LoopOnce, 1)
      curAction.clampWhenFinished = true
      curAction.crossFadeFrom(prevAction, 0.2, true)
      curAction.play()
      this._parent.audioController.play(this._parent.vehicle.position, '/sounds/jump.wav', false)
      // Use opacity (a custom property) for fade-in/fade-out
      prevAction.crossFadeTo(curAction, 0.2, true)
      prevAction.enabled = true
      prevAction.setEffectiveTimeScale(1)
      prevAction.setEffectiveWeight(1)

      // Fade out the previous animation
      prevAction.fadeOut(0.2)

      // Fade in the current animation
      curAction.setEffectiveWeight(1)
      curAction.fadeIn(0.2)
    } else {
      curAction.play()
    }
  }

  _Finished() {
    this._Cleanup()
    // this._parent.SetState(this.prevState.Name)
    this._parent.SetState('idle')
  }

  _Cleanup() {
    const action = this._parent._proxy._animations['jump'].action
    action.getMixer().removeEventListener('finished', this._CleanupCallback)
  }

  Exit() {
    this._Cleanup()
    this._parent.audioController.stop('/sounds/jump.wav')
  }

  Update(t, input) {
    
  }
}
