import { State } from './State.js';

export class WalkBackState extends State {
  constructor(parent) {
    super(parent);
  }

  get Name() {
    return 'walk_back';
  }

  Enter(prevState) {
    const curAction = this._parent._proxy._animations['walk_back'].action;
    if (prevState) {
      const prevAction = this._parent._proxy._animations[prevState.Name].action;

      curAction.enabled = true;

      if (prevState.Name === 'run') {
        const ratio = curAction.getClip().duration / prevAction.getClip().duration;
        curAction.time = prevAction.time * ratio;
      } else {
        curAction.time = 0.0;
        curAction.setEffectiveTimeScale(1.0);
        curAction.setEffectiveWeight(1.0);
      }

      curAction.crossFadeFrom(prevAction, 0.5, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

  Exit() {}

  Update(timeElapsed, input) {
    if (input._keys.forward) {
      this._parent.SetState('walk');
    } else if (!input._keys.forward && input._keys.backward) {
      this._parent.SetState('walk_back');
      if (input._keys.space) {
        this._parent.SetState('jump')
      }
      return;
    } else {
      this._parent.SetState('idle');
    }
  }
}
