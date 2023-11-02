import * as THREE from 'three'
import * as CANNON from 'cannon'

export default class BoxGenerator {
  constructor(scene, world) {
    this.scene = scene
    this.boxes = []
    this.world = world
    // Material for the boxes
    this.boxMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 })
  }

  createBox(x, y, z) {
    const boxSize = 10 // Adjust the size as needed
    const boxGeometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize)
    const boxMesh = new THREE.Mesh(boxGeometry, this.boxMaterial)
    boxMesh.position.set(x, y, z)

    // Add the box to the scene
    this.scene.add(boxMesh)

    // Store the box in the array for collision detection
    this.boxes.push(boxMesh)

    const boxShape = new CANNON.Box(new CANNON.Vec3(boxSize, boxSize, boxSize)) // Adjust size as needed
    const boxBody = new CANNON.Body({ mass: 1 })
    boxBody.addShape(boxShape)
    boxBody.position.set(x, y, z) // Set the initial position of the box
    this.world.addBody(boxBody)
  }

  update() {
    // Add your box-related logic here
  }
}
