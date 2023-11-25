import * as CANNON from 'cannon-es'
import * as THREE from 'three'
import { BatchedParticleRenderer, QuarksLoader } from 'three.quarks' // Import only ParticleEmitter

export default class BallGenerator {
  constructor(scene, cannon, playerId) {
    this.scene = scene
    this.playerId = playerId
    this._world = cannon._world
    this.balls = []
    this.magicEmitters = []
    this.particleSystems = null
    this.batchSystem = new BatchedParticleRenderer()
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
      // transparent: true,
      // opacity: 0
    })

    const fireballGeometry = new THREE.SphereGeometry(2, 32, 32)
    const mesh = new THREE.Mesh(fireballGeometry, fireballMaterial)
    mesh.castShadow = true
    mesh.position.set(x, y, z)
    this.scene.add(mesh)

    this.scene.add(this.batchSystem)
    let loader = new QuarksLoader()
    loader.setCrossOrigin('')
    loader.load(
      './atom.json',
      (object3D) => {
        object3D.position.set(x, y, z)
        object3D.scale.set(0.3, 0.3, 0.3)

        object3D.traverse((child) => {
          if (child.type === 'ParticleEmitter') {
            // Store the particle system with each ball
            const ball = { mesh, body: { ...body }, particleSystem: child }
            this.balls.push(ball)
            // Add the system to the batch renderer
            this.batchSystem.addSystem(child.system)

            body.addEventListener('collide', (event) => {
              this.handleCollision(ball)
            })
            this.cleanUp(ball, 3)
          }
        })
        this.particleSystems = object3D
        // this.scene.add(this.particleSystems)
      },
      () => {},
      () => {}
    )
  }

  handleCollision(ball) {
    this.cleanUp(ball, 2)
  }

  cleanUp(ball, seconds) {
    setTimeout(() => {
      this.scene.remove(ball.mesh)

      if (ball.particleSystem) {
        this.batchSystem.deleteSystem(ball.particleSystem.system)
      }

      this._world.removeBody(ball.body)
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

      if (ball.particleSystem) {
        const ballPosition = ball.body.position.clone()

        // Calculate the offset between the ball and the particle system
        const offset = new THREE.Vector3()
        ball.particleSystem.getWorldPosition(offset)
        offset.sub(ballPosition)

        // Apply the offset to align the particle system with the ball
        ball.particleSystem.position.sub(offset)
      }
    }
    
    this.batchSystem.update(timeInSeconds)
  }
}
