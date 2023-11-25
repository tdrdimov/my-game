import { IdleState } from './IdleState.js'
import { WalkState } from './WalkState.js'
import { JumpState } from './JumpState.js'
import { IdleWaitState } from './IdleWaitState.js'
import { Magic1State } from './Magic1State.js'
import { DeathState } from './DeathState.js'
export class FiniteStateMachine {
  constructor() {
    this._states = {}
    this._currentState = null
  }

  _AddState(name, type) {
    this._states[name] = type
  }

  SetState(name) {
    const prevState = this._currentState

    if (prevState) {
      if (prevState.Name == name) {
        return
      }
      prevState.Exit()
    }

    const state = new this._states[name](this)
    this._currentState = state
    state.Enter(prevState)
  }

  Update(timeElapsed, input) {
    if (this._currentState) {
      this._currentState.Update(timeElapsed, input)
    }
  }
}

export class CharacterFSM extends FiniteStateMachine {
  constructor(proxy, entity, vehicle) {
    super()
    this._proxy = proxy
    this.entity = entity
    this.vehicle = vehicle
    this._Init()
  }

  _Init() {
    this._AddState('idle', IdleState)
    this._AddState('walk', WalkState)
    this._AddState('jump', JumpState)
    this._AddState('idleWait', IdleWaitState)
    this._AddState('magic1', Magic1State)
    this._AddState('death', DeathState)
  }
}
