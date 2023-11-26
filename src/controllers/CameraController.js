import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default class CameraFollowController {
  constructor(camera, target, renderer, entityManager) {
    this.camera = camera
    this.target = target
    this.entityManager = entityManager
    this.renderer = renderer
    this.distance = 100 // The distance between the character and camera
    this.height = 60 // The height of the camera above the character
    this.Init()
  }

  Init() {
    // this.controlCameraWithMouse()
  }

  Update(timeElapsed) {
    this.stickCameraBehindCharacter()
  }

  stickCameraBehindCharacter() {
    const character = this.entityManager.entities[0]
    const newPosition = new THREE.Vector3()
    newPosition.x = character.position.x
    newPosition.y = character.position.y
    newPosition.z = character.position.z
    const targetPosition = newPosition.clone()
    const cameraOffset = new THREE.Vector3(0, this.height, -this.distance)

    const rotationMatrix = new THREE.Matrix4()

    const offset = cameraOffset.clone().applyMatrix4(rotationMatrix)
    const cameraPosition = targetPosition.clone().add(offset)
    const dampingFactor = 0.02
    // Set the camera's position
    this.camera.position.lerp(cameraPosition, dampingFactor)

    // Make the camera look at the target object
    this.camera.lookAt(targetPosition)
  }

  controlCameraWithMouse() {
    const controls = new OrbitControls(this.camera, this.renderer.domElement)
    controls.target.set(0, 10, 0)
    controls.update()
  }
}
