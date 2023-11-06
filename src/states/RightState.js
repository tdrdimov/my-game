import { State } from './State.js'
export class RightState extends State {
  constructor(parent) {
    super(parent)
  }

  get Name() {
    return 'right'
  }

  Enter(prevState) {
    const curAction = this._parent._proxy._animations['right'].action
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
    input._keys.right = false
    setTimeout(() => {
      input._keys.right = true
    }, 50)
  }

  Update(timeElapsed, input) {
    if (input._keys.right) {
      if (input._keys.forward) {
        this.resetAnimation(input)
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