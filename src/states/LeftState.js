import { State } from './State.js'
import * as THREE from 'three'
export class LeftState extends State {
  constructor(parent) {
    super(parent)
  }

  get Name() {
    return 'left'
  }

  Enter(prevState) {
    const curAction = this._parent._proxy._animations['left'].action
    if (prevState) {
      const prevAction = this._parent._proxy._animations[prevState.Name].action

      curAction.enabled = true
      curAction.crossFadeFrom(prevAction, 0.2, true)

      if (prevState.Name == 'run') {
        const ratio = curAction.getClip().duration / prevAction.getClip().duration
        curAction.time = prevAction.time * ratio
      } else {
        curAction.time = 0.0
        curAction.setEffectiveTimeScale(1.0)
        curAction.setEffectiveWeight(1.0)
      }

      curAction.play()
    } else {
      curAction.play()
    }
  }

  Exit() {}

  resetAnimation(input) {
    input._keys.left = false
    setTimeout(() => {
      input._keys.left = true
    }, 50)
  }

  Update(timeElapsed, input) {
    if (input._keys.left) {
      if (input._keys.forward) {
        this.resetAnimation(input)
        if (input._keys.right) {
          this.resetAnimation(input)
        }
      }
      if (input._keys.backward) {
        this.resetAnimation(input)
      }
      if (input._keys.space) {
        this._parent.SetState('jump')
        this.resetAnimation(input)
      }
      return
    } else {
      this._parent.SetState('idle')
    }
  }
}
