import BallGenerator from '../generators/BallGenerator'
import * as THREE from 'three'

export class ShootSpell {
  constructor(params) {
    this._params = params
    this.ballGenerator = new BallGenerator(this._params.scene, this._params.cannon)
    this.magic1KeyIsPressed = false
  }

  cast() {
    if (this._params.input._keys.magic1 && !this.magic1KeyIsPressed) {
      // Copy the player's position and quaternion
      const modelRotation = this._params.body.quaternion.clone().normalize()
      const modelForward = new THREE.Vector3(0, 0, -1).applyQuaternion(modelRotation)
      const playerPosition = this._params.body.position.clone()
      const playerQuaternion = modelRotation

      // Set the offset for the ball in front of the player
      const offsetDistance = 10 // Adjust this value based on your preference
      const offset = new THREE.Vector3(0, 0, offsetDistance)
      offset.applyQuaternion(playerQuaternion)

      // Calculate the position of the ball
      const ballPosition = new THREE.Vector3().copy(playerPosition).add(offset)

      // Calculate the velocity of the ball based on the player's rotation
      const ballVelocityMagnitude = 100 // Adjust the speed as needed
      const ballVelocity = modelForward.clone().multiplyScalar(-ballVelocityMagnitude)

      // Create the ball at the calculated position
      setTimeout(() => {
        this.ballGenerator.createBall(
          ballPosition.x,
          ballPosition.y + 15,
          ballPosition.z,
          ballVelocity
        )
      }, 1000)

      // Set the flag to indicate that the magic1 key is pressed
      this.magic1KeyIsPressed = true
    } else if (!this._params.input._keys.magic1) {
      // Reset the flag when the magic1 key is released
      this.magic1KeyIsPressed = false
    }
    this.ballGenerator.update()
  }
}
