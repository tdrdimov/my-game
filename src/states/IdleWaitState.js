import { State } from './State.js'

export class IdleWaitState extends State {
  constructor(parent) {
    super(parent);
    this._waitDuration = 5; // Duration in seconds before transitioning to idle
    this._timer = 0;
  }

  get Name() {
    return 'idleWait';
  }

  Enter(prevState) {
    const idleAction = this._parent._proxy._animations['idleWait']?.action
    this._parent.audioController.stop('/sounds/walking.mp3')
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

  Exit() {
    // Cleanup and stop the idle wait animation
    // You can add code to stop the wait animation here
  }

  Update(timeElapsed, input) {
    this._timer += timeElapsed;

    // if (this._timer >= this._waitDuration) {
    //   this._parent.SetState('idle'); // Transition back to idle after waiting
    // }

    if (input._keys.forward) {
      this._parent.SetState('walk');
    } else if (input._keys.space) {
      this._parent.SetState('jump')
    } else if (input._keys.magic1) {
      this._parent.SetState('magic1')
    }
  }
}
