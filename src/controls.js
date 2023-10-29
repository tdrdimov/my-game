export class Controls {
  constructor(michelle, camera) {
    this.michelle = michelle
    this.camera = camera

    this.keyboardState = {
      KeyW: false,
      KeyS: false,
      KeyA: false,
      KeyD: false,
      Space: false
    }

    this.isJumping = false
    this.jumpHeight = 3
    this.jumpVelocity = 0
    this.gravity = 0.01
    this.rotationSpeed = 0.04
    this.cameraDistance = 3

    document.addEventListener('keydown', (event) => {
      this.keyboardState[event.code] = true
    })

    document.addEventListener('keyup', (event) => {
      this.keyboardState[event.code] = false
    })
  }

  handleInput() {
    const michelleModel = this.michelle.gltfModel

    if (this.keyboardState.KeyW) {
      this.michelle.playAnimation('run_forward_anim')
      this.michelle.mixer?.update(0.01);
      // Calculate the forward direction based on michelle's rotation
      const angle = michelleModel.rotation.y
      const x = Math.sin(angle)
      const z = Math.cos(angle)

      // Update the michelle's position to move forward
      michelleModel.position.x += x * 0.05
      michelleModel.position.z += z * 0.05
      
    }

    if (this.keyboardState.KeyS) {
      this.michelle.playAnimation('run_backward_anim')
      this.michelle.mixer?.update(0.01);
      // Calculate the forward direction based on michelle's rotation
      const angle = michelleModel.rotation.y
      const x = Math.sin(angle)
      const z = Math.cos(angle)

      // Update the michelle's position to move forward
      michelleModel.position.x -= x * 0.1
      michelleModel.position.z -= z * 0.1
    }

    // Rotate the michelle on A and D key presses
    if (this.keyboardState.KeyA) michelleModel.rotation.y += this.rotationSpeed
    if (this.keyboardState.KeyD) michelleModel.rotation.y -= this.rotationSpeed

    // Handle spacebar input for jumping
    if (this.keyboardState.Space && !this.isJumping) {
      this.michelle.playAnimation('jump_anim')
      this.michelle.mixer?.update(0.01);
      this.isJumping = true
      this.jumpVelocity = 0.3 // Set the initial jump velocity
    }

    // Apply gravity to the jump
    if (this.isJumping) {
      michelleModel.position.y += this.jumpVelocity
      this.jumpVelocity -= this.gravity

      if (michelleModel.position.y <= 0) {
        michelleModel.position.y = 0
        this.isJumping = false
        this.jumpVelocity = 0 // Reset the jump velocity on the ground
      }
    }

    // Update the camera's position to follow michelle from behind
    const angle = michelleModel.rotation.y
    const x = Math.sin(angle)
    const z = Math.cos(angle)

    this.camera.position.x = michelleModel.position.x - x * this.cameraDistance
    this.camera.position.z = michelleModel.position.z - z * this.cameraDistance
    this.camera.position.y = michelleModel.position.y + 2 // Adjust the camera's height
    this.camera.lookAt(michelleModel.position)
  }
}
