import * as THREE from 'three'
import * as CANNON from 'cannon-es'

export default class BallGenerator {
  constructor(scene, cannon) {
    this.scene = scene
    this._world = cannon._world
    this.balls = []
  }

  createBall(x, y, z) {
    const textureLoader = new THREE.TextureLoader()
    const texture = textureLoader.load('./soccer_texture.jpg')
    const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, map: texture })
    const sphereGeometry = new THREE.SphereGeometry(2, 20, 20)
    const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
    mesh.castShadow = true
    mesh.position.set(x, y, z)
    mesh.flatShading = true
    this.scene.add(mesh)

    // Cannon.js body
    const shape = new CANNON.Sphere(2, 40, 40)

    const body = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(0, 3, 0),
      shape: shape,
      material: this._world.defaultMaterial
    })
    body.position.copy(mesh.position)
    body.addEventListener('collide', this.onColide)
    body.linearDamping = 0.2
    this._world.addBody(body)
    // Store the balls in the array for collision detection
    this.balls.push({ mesh, body })
  }

  onColide(firstImpact) {
    // console.log(firstImpact)
  }

  update() {
    for (const ball of this.balls) {
      ball.mesh.position.copy(ball.body.position)
      ball.mesh.quaternion.copy(ball.body.quaternion)
    }
  }
}
