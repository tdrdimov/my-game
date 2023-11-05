import * as CANNON from 'cannon-es'
import * as THREE from 'three'

export class Floor {
  constructor(scene, cannon) {
    this._scene = scene
    this._world = cannon._world
    this._CreateFloor()
  }

  _CreateFloor() {
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200, 20, 20),
      new THREE.MeshStandardMaterial({
        color: 0x808080
      })
    )
    plane.castShadow = false
    plane.receiveShadow = true
    plane.rotation.x = -Math.PI / 2
    this._scene.add(plane)

    const floorShape = new CANNON.Plane()
    const floorBody = new CANNON.Body()
    floorBody.mass = 0
    floorBody.addShape(floorShape)
    floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5)
    this._world.addBody(floorBody)
  }
}