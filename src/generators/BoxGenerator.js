import * as THREE from "three";
export default class BoxGenerator {
  constructor(scene) {
    this.scene = scene;
    this.boxes = [];

    // Material for the boxes
    this.boxMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  }

  createBox(x, y, z) {
    const boxSize = 10; // Adjust the size as needed
    const boxGeometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
    const boxMesh = new THREE.Mesh(boxGeometry, this.boxMaterial);
    boxMesh.position.set(x, y, z);

    // Add the box to the scene
    this.scene.add(boxMesh);

    // Store the box in the array for collision detection
    this.boxes.push(boxMesh);
  }

  update() {
    // Add your box-related logic here
  }
}
