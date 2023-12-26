import { State } from './State.js'

export class WalkState extends State {
  constructor(parent) {
    super(parent)
  }

  get Name() {
    return 'walk'
  }

  Enter(prevState) {
    const curAction = this._parent._proxy._animations['walk'].action
    
    if (prevState) {
      const prevAction = this._parent._proxy._animations[prevState.Name].action

      curAction.enabled = true

      curAction.time = 0.0
      curAction.setEffectiveTimeScale(1.0)
      curAction.setEffectiveWeight(1.0)

      curAction.crossFadeFrom(prevAction, 0.5, true)
      curAction.play()
      
      if (!this._parent.audioController.isPlaying('/sounds/walking.mp3')) {
        this._parent.audioController.play(this._parent.vehicle.position, '/sounds/walking.mp3', true, 1.4)
      }
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

  Exit() {
    this._parent.audioController.stop('/sounds/walking.mp3')
  }

  Update(timeElapsed, input) {
    if (input._keys.forward) {
      if (input._keys.space) {
        this._parent.audioController.stop('/sounds/walking.mp3')
        this._parent.SetState('jump')
      } else if (input._keys.magic1) {
        this._parent.audioController.stop('/sounds/walking.mp3')
        this._parent.SetState('magic1')
      }
      return
    }
    this._parent.audioController.stop('/sounds/walking.mp3')
    this._parent.SetState('idle')
  }
}
