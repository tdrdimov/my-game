import { State } from './State.js'
import * as THREE from 'three'

export class ReceiveDmgState extends State {
  constructor(parent) {
    super(parent)
    this.prevState = null
    this._FinishedCallback = () => {
      this._Finished()
    }
  }

  get Name() {
    return 'receiveDmg'
  }

  Enter(prevState) {
    const curAction = this._parent._proxy._animations['receiveDmg'].action
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
    const action = this._parent._proxy._animations['receiveDmg'].action

    action.getMixer().removeEventListener('finished', this._CleanupCallback)
  }

  Exit() {
    this._Cleanup()
  }

  Update(timeElapsed, input) {
    if (input._keys.forward) {
      this._parent.SetState('walk')
    } else if (input._keys.space) {
      this._parent.SetState('jump')
    } else if (input._keys.magic1) {
      this._parent.SetState('magic1')
    }
  }
}
