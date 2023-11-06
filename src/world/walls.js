import * as THREE from 'three'
import * as CANNON from 'cannon-es'

export class Walls {
  constructor(scene, cannon) {
    this._scene = scene
    this._world = cannon._world
    this._walls = []
    
    this.wallHeight = 10
    this.wallThickness = 1
    this.planeWidth = 300
    this.planeHeight = 150
    this._Initialize()
  }

  _CreateWalls(x, z, rotation, width) {
    const wallGeometry = new THREE.BoxGeometry(this.wallThickness, this.wallHeight, width)
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x808080 // Adjust the color
    })
    const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial)
    wallMesh.position.set(x, this.wallHeight / 2, z)
    wallMesh.rotation.y = rotation
    this._scene.add(wallMesh)

    const wallShape = new CANNON.Box(
      new CANNON.Vec3(this.wallThickness / 2, this.wallHeight / 2, width / 2)
    )
    const wallBody = new CANNON.Body({ mass: 0 })
    wallBody.addShape(wallShape)
    wallBody.position.set(x, this.wallHeight / 2, z)
    wallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rotation)
    this._world.addBody(wallBody)
  }

  _Initialize() {
    this._CreateWalls(0, -this.planeHeight / 2 - this.wallThickness / 2, Math.PI / 2, 300) // Bottom wall
    this._CreateWalls(0, this.planeHeight / 2 + this.wallThickness / 2, Math.PI / 2, 300) // Top wall
    this._CreateWalls(-this.planeWidth / 2 - this.wallThickness / 2, 0, Math.PI * 2, 150) // Left wall
    this._CreateWalls(this.planeWidth / 2 + this.wallThickness / 2, 0, Math.PI * 2, 150) // Right wall
  }
}
