import * as CANNON from 'cannon-es'
import * as THREE from 'three'
import Nebula, { SpriteRenderer } from 'three-nebula'
import json from './SpellParticles.json'

export default class BallGenerator {
  constructor(scene, cannon, playerId, socket) {
    this.scene = scene
    this.playerId = playerId
    this.socket = socket
    this._world = cannon._world
    this.balls = []
  }

  createBall(x, y, z, velocity) {
    // Your existing code for creating cannon.js body and three.js mesh
    const shape = new CANNON.Sphere(2)
    const body = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(x, y, z),
      shape: shape,
      material: this._world.defaultMaterial,
      type: CANNON.Body.DYNAMIC,
      allowSleep: false
    })
    body.linearDamping = 0.1
    body.velocity.set(velocity.x, velocity.y, velocity.z)
    body.id = this.playerId

    this._world.addBody(body)

    const fireballMaterial = new THREE.MeshStandardMaterial({
      color: 0xffa500,
      transparent: true,
      opacity: 0
    })

    const fireballGeometry = new THREE.SphereGeometry(0, 32, 32)
    const mesh = new THREE.Mesh(fireballGeometry, fireballMaterial)
    mesh.castShadow = true
    mesh.position.set(x, y, z)
    this.scene.add(mesh)

    let nebula = null
    Nebula.fromJSONAsync(json, THREE).then((loaded) => {
      const nebulaRenderer = new SpriteRenderer(this.scene, THREE)
      nebula = loaded.addRenderer(nebulaRenderer)

      const ball = { mesh, body: { ...body }, nebula, nebulaRenderer }
      this.balls.push(ball)

      body.addEventListener('collide', (event) => {
        if (event.body.id !== this.socket.id) {
          this.handleCollision(ball, event)
        }
      })
      this.cleanUp(ball, 3)
    })
  }

  handleCollision(ball, event) {
    const ev = { ...event }
    if (ev.body.id.includes('player')) {
      // add particles effect as hit
    }

    this.cleanUp(ball, 0)
  }

  cleanUp(ball, seconds) {
    setTimeout(() => {
      this.scene.remove(ball.mesh)
      this._world.removeBody(ball.body)

      // remove nebula sprite particles
      if (ball.nebula && ball.nebula.emitters.length) {
        const emitter = ball.nebula.emitters[0]
        emitter.removeAllParticles()
        emitter.update()
        ball.nebula.destroy()
      }

      const index = this.balls.indexOf(ball)
      if (index !== -1) {
        this.balls.splice(index, 1)
      }
    }, seconds * 1000)
  }

  update(timeInSeconds) {
    // Your existing code for updating cannon.js bodies and three.js meshes
    for (const ball of this.balls) {
      ball.mesh.position.copy(ball.body.position)
      ball.mesh.quaternion.copy(ball.body.quaternion)
      if (ball.nebula && ball.nebula.emitters[0]) {
        ball.nebula.emitters[0].position.copy(ball.mesh.position)
        ball.nebula.update(timeInSeconds)
      }
    }
  }
}
