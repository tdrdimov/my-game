import * as THREE from 'three'
import * as CANNON from 'cannon-es'

export default class BoxGenerator {
  constructor(scene, cannon) {
    this.scene = scene
    this._world = cannon._world
    this.boxes = []

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

    // Cannon.js body
    const shape = new CANNON.Box(new CANNON.Vec3(boxSize * 0.5, boxSize * 0.5, boxSize * 0.5))

    const body = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(0, 3, 0),
      shape: shape,
      material: this._world.defaultMaterial
    })
    body.position.copy(boxMesh.position)
    body.addEventListener('collide', this.onColide)
    this._world.addBody(body)

    // Store the box in the array for collision detection
    this.boxes.push({boxMesh, body})
  }

  onColide(firstImpact) {
    // console.log(firstImpact)
  }

  update() {
    for(const box of this.boxes)
    {
      box.boxMesh.position.copy(box.body.position)
      box.boxMesh.quaternion.copy(box.body.quaternion)
    }
  }
}
