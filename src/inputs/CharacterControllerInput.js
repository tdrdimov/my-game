export default class CharacterControllerInput {
  constructor(socket, playerId) {
    this._socket = socket
    this._playerId = playerId
    this.isShooting = false
    this.isJumping = false
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
      shift: false,
      death: false
    }
    document.addEventListener('keydown', (e) => this._onKeyDown(e), false)
    document.addEventListener('keyup', (e) => this._onKeyUp(e), false)
  }

  _onKeyDown(event) {
    switch (event.keyCode) {
      case 81: // q
        this._keys.magic1 = false
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
        if (this._socket.id === this._playerId && !this.isShooting) {
          if (!event.repeat && !this.isJumping) {
            this._keys.space = true
            this.isJumping = true

            let cooldown = 800
            this.updateCooldownUI('jump', cooldown)
            const intervalId = setInterval(() => {
              cooldown -= 100
              this.updateCooldownUI('jump', cooldown)
              if (cooldown <= 0) {
                clearInterval(intervalId)
                this.isJumping = false
              }
            }, 100)

            setTimeout(() => {
              this.isJumping = false
            }, 800)
          } else {
            this._keys.space = false
          }
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
        if (this._socket.id === this._playerId && !this.isJumping) {
          if (event.timeStamp - this.lastQKeyPressTimestamp > this.timeInterval && !event.repeat) {
            this._keys.magic1 = true
            this.isShooting = true

            let cooldown = 1600
            this.updateCooldownUI('fire', cooldown)
            const intervalId = setInterval(() => {
              cooldown -= 100
              this.updateCooldownUI('fire', cooldown)
              if (cooldown <= 0) {
                clearInterval(intervalId)
                this.isShooting = false
              }
            }, 100)

            setTimeout(() => {
              this.isShooting = false
              this._keys.magic1 = false
            }, 500)
            this.lastQKeyPressTimestamp = event.timeStamp
          } else {
            this._keys.magic1 = false
          }
        }
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

  updateCooldownUI(skill, cooldown) {
    const button = document.getElementById(`${skill}-button`)
    if (button) {
      button.classList.add('isLoading')
    }
    const element = document.getElementById(`${skill}-cooldown`)
    if (element) {
      element.innerText = `${cooldown / 1000}s`
    }

    setTimeout(() => {
      button.classList.remove('isLoading')
      element.innerText = ''
    }, cooldown)
  }
}
