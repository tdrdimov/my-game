export default class CharacterControllerInput {
  constructor() {
    this._Init()
  }

  _Init() {
    this.lastQKeyPressTimestamp = 0
    this.timeInterval = 1800
    this._keys = {
      magic1: false,
      backward: false,
      left: false,
      right: false,
      space: false,
      shift: false
    }
    document.addEventListener('keydown', (e) => this._onKeyDown(e), false)
    document.addEventListener('keyup', (e) => this._onKeyUp(e), false)
  }

  _onKeyDown(event) {
    switch (event.keyCode) {
      case 81: // q
        if (event.timeStamp - this.lastQKeyPressTimestamp > this.timeInterval && !event.repeat) {
          this._keys.magic1 = true
          this.lastQKeyPressTimestamp = event.timeStamp
        } else {
          this._keys.magic1 = false
        }
        break
      case 87: // w
        this._keys.left = true
        break
      case 83: // s
        this._keys.backward = true
        break
      case 68: // d
        this._keys.right = true
        break
      case 32: // SPACE
        if (!event.repeat) {
          this._keys.space = true
        } else {
          this._keys.space = false
        }
        break
      case 16: // SHIFT
        this._keys.shift = true
        break
    }
  }

  _onKeyUp(event) {
    switch (event.keyCode) {
      case 81: // q
        this._keys.magic1 = false
        break
      case 87: // w
        this._keys.left = false
        break
      case 83: // s
        this._keys.backward = false
        break
      case 68: // d
        this._keys.right = false
        break
      case 32: // SPACE
        this._keys.space = false
        break
      case 16: // SHIFT
        this._keys.shift = false
        break
    }
  }
}
