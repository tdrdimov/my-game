import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default class CameraFollowController {
  constructor(camera, target, renderer) {
    this.camera = camera
    this.target = target
    this.renderer = renderer
    this.distance = 50 // The distance between the character and camera
    this.height = 60 // The height of the camera above the character
    this.Init()
  }

  Init() {
    // this.controlCameraWithMouse()
  }

  Update() {
    this.stickCameraBehindCharacter()
  }

  stickCameraBehindCharacter() {
    const targetPosition = this.target.position.clone()
    const cameraOffset = new THREE.Vector3(0, this.height, -this.distance)

    const rotationMatrix = new THREE.Matrix4()

    // stick camera from behind the character
    // rotationMatrix.makeRotationFromEuler(this.target.rotation)

    const offset = cameraOffset.clone().applyMatrix4(rotationMatrix)

    const cameraPosition = targetPosition.clone().add(offset)

    // Set the camera's position
    this.camera.position.copy(cameraPosition)

    // Make the camera look at the target object
    this.camera.lookAt(targetPosition)
  }

  controlCameraWithMouse() {
    const controls = new OrbitControls(this.camera, this.renderer.domElement)
    controls.target.set(0, 10, 0)
    controls.update()
  }
}
