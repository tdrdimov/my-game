import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default class CameraFollowController {
  constructor(camera, target, renderer, entityManager) {
    this.camera = camera
    this.target = target
    this.entityManager = entityManager
    this.renderer = renderer
    this.distance = 50 // The distance between the character and camera
    this.height = 80 // The height of the camera above the character
    this.Init()
  }

  Init() {
    // this.controlCameraWithMouse()
  }

  Update() {
    this.stickCameraBehindCharacter()
  }

  stickCameraBehindCharacter() {
    const newPosition = new THREE.Vector3()
    newPosition.x = this.entityManager.entities[0].position.x
    newPosition.y = this.entityManager.entities[0].position.y
    newPosition.z = this.entityManager.entities[0].position.z
    const targetPosition = newPosition.clone()
    const cameraOffset = new THREE.Vector3(0, this.height, -this.distance)

    const rotationMatrix = new THREE.Matrix4()

    const offset = cameraOffset.clone().applyMatrix4(rotationMatrix)
    const cameraPosition = targetPosition.clone().add(offset)
    const dampingFactor = 0.01
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
