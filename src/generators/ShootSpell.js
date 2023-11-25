import BallGenerator from './SpellGenerator'
import * as THREE from 'three'

export class ShootSpell {
  constructor(params) {
    this._params = params
    this.ballGenerator = new BallGenerator(
      this._params.scene,
      this._params.cannon,
      this._params.playerId,
    )
    this.magic1KeyIsPressed = false
    this.characterHeight = 15
    this._params.socket.on('shoot-spell', (playerId, spellInfo) => {
      if (this._params.socket.id !== playerId) {
        setTimeout(() => {
          this.ballGenerator.createBall(
            spellInfo.position.x,
            spellInfo.position.y + this.characterHeight,
            spellInfo.position.z,
            spellInfo.velocity
          )
        }, 700)
      }
    })
  }

  cast(timeInSeconds) {
    if (this._params.input._keys.magic1 && !this.magic1KeyIsPressed) {
      // Copy the player's position and quaternion
      const modelRotation = this._params.body.quaternion.clone().normalize()
      const modelForward = new THREE.Vector3(0, 0, -1).applyQuaternion(modelRotation)
      const playerPosition = this._params.body.position.clone()
      const playerQuaternion = modelRotation

      // Set the offset for the ball in front of the player
      const offsetDistance = 15 // Adjust this value based on your preference
      const offset = new THREE.Vector3(0, 0, offsetDistance)
      offset.applyQuaternion(playerQuaternion)

      // Calculate the position of the ball
      const ballPosition = new THREE.Vector3().copy(playerPosition).add(offset)

      // Calculate the velocity of the ball based on the player's rotation
      const ballVelocityMagnitude = 20 // Adjust the speed as needed
      const ballVelocity = modelForward.clone().multiplyScalar(-ballVelocityMagnitude)

      // Emit a 'shoot-spell' event with the player's ID and spell information
      const spellInfo = {
        position: ballPosition,
        velocity: ballVelocity
        // Include any other necessary spell information
      }

      // Create the ball at the calculated position
      this._params.socket.emit('shoot-spell', this._params.playerId, spellInfo)
      if (this._params.playerId === this._params.socket.id) {
        setTimeout(() => {
          this.ballGenerator.createBall(
            spellInfo.position.x,
            spellInfo.position.y + this.characterHeight,
            spellInfo.position.z,
            spellInfo.velocity
          )
        }, 700)
      }
      
      // Set the flag to indicate that the magic1 key is pressed
      this.magic1KeyIsPressed = true
    } else if (!this._params.input._keys.magic1) {
      // Reset the flag when the magic1 key is released
      this.magic1KeyIsPressed = false
    }
    this.ballGenerator.update(timeInSeconds)
  }
}
