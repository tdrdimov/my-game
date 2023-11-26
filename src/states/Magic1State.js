import { State } from './State.js'
import * as THREE from 'three'

export class Magic1State extends State {
  constructor(parent) {
    super(parent)
    this.prevState = null
    this.parent = parent
    this._FinishedCallback = () => {
      this._Finished()
    }
  }

  get Name() {
    return 'magic1'
  }

  Enter(prevState) {
    const curAction = this._parent._proxy._animations['magic1'].action
    
    const mixer = curAction.getMixer()
    mixer.addEventListener('finished', this._FinishedCallback)

    if (prevState) {
      this.prevState = prevState
      const prevAction = this._parent._proxy._animations[prevState.Name].action

      curAction.reset()
      curAction.setLoop(THREE.LoopOnce, 1)
      curAction.clampWhenFinished = true
      curAction.crossFadeFrom(prevAction, 0.2, true)
      curAction.play()

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
    this._parent.SetState(this.prevState.Name)
  }

  _Cleanup() {
    const action = this._parent._proxy._animations['magic1'].action

    action.getMixer().removeEventListener('finished', this._CleanupCallback)
  }

  Exit() {
    this._Cleanup()
  }

  Update(timeElapsed, input) {
    const action = this._parent._proxy._animations['magic1'].action
    action.timeScale = 1.4
    const endAction = this._parent._proxy._animations['idle'].action // The animation that represents the end pose
    const nearEnd = action._clip.duration * 0.8 // 90% of the animation duration

    if (action.time >= nearEnd) {
      const duration = 0.2 // The duration of the blend
      action.paused = true
      this._parent.SetState('idle')
      endAction.reset().fadeIn(duration).play()
    }

    if (input._keys.forward && !timeElapsed) {
      this._parent.SetState('walk')
    }
    if (timeElapsed) {
      // stop character from moving while casting
      const currentPosition = this.parent.vehicle.position.clone()
      this.parent.entity.position.copy(currentPosition)
    }
  }
}
