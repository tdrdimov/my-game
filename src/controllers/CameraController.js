export default class CameraFollowController {
  constructor(camera, target) {
    this.camera = camera;
    this.target = target;
    this.distance = 40; // The distance between the character and camera
    this.height = 30;  // The height of the camera above the character
  }

  Update() {
    const angle = this.target.rotation.y;
    const x = Math.sin(angle);
    const z = Math.cos(angle);
    
    this.camera.position.x = this.target.position.x - x * this.distance;
    this.camera.position.z = this.target.position.z - z * this.distance;
    this.camera.position.y = this.target.position.y + this.height;
    this.camera.lookAt(this.target.position);
  }
}
