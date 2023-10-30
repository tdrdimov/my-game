import { State } from './State.js'
export class IdleState extends State {
  constructor(parent) {
    super(parent)
    this._timer = 0;
  }

  get Name() {
    return 'idle'
  }

  Enter(prevState) {
    const idleAction = this._parent._proxy._animations['idle'].action
    if (prevState) {
      const prevAction = this._parent._proxy._animations[prevState.Name].action
      idleAction.time = 0.0
      idleAction.enabled = true
      idleAction.setEffectiveTimeScale(1.0)
      idleAction.setEffectiveWeight(1.0)
      idleAction.crossFadeFrom(prevAction, 0.5, true)
      idleAction.play()
    } else {
      idleAction.play()
    }
  }

  Exit() {}

  Update(timeElapsed, input) {
    if (input._keys.forward) {
      this._parent.SetState('walk')
    } else if (input._keys.space) {
      this._parent.SetState('jump')
    } else if (input._keys.backward) {
      this._parent.SetState('walk_back')
    } else {
      // Check if it's time to transition to idle wait state
      this._timer += timeElapsed;
      if (this._timer >= 10) { // 10 seconds
        this._parent.SetState('idleWait');
      }
    }
  }
}