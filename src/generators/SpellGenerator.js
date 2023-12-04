import * as CANNON from 'cannon-es'
import * as THREE from 'three'
import {
  SphereEmitter,
  ConstantValue,
  IntervalValue,
  PointEmitter,
  RandomColor,
  RenderMode,
  ParticleSystem,
  BatchedParticleRenderer
} from 'three.quarks'

export default class BallGenerator {
  constructor(scene, cannon, playerId, socket) {
    this.scene = scene
    this.playerId = playerId
    this.socket = socket
    this._world = cannon._world
    this.balls = []
    this.magicEmitters = []
    this.particleSystems = null
    this.batchSystem = new BatchedParticleRenderer()
    this.dmgParticles = null
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
      opacity: 0.1
    })

    const fireballGeometry = new THREE.SphereGeometry(2, 32, 32)
    const mesh = new THREE.Mesh(fireballGeometry, fireballMaterial)
    mesh.castShadow = true
    mesh.position.set(x, y, z)
    this.scene.add(mesh)

    this.scene.add(this.batchSystem)

    const particles = this.initParticleSystem()
    particles.emitterShape = new SphereEmitter({
      radius: 2,
      thickness: 1,
      arc: Math.PI * 2
    })

    particles.emitter.position.set(x, y, z)
    this.batchSystem.addSystem(particles)
    this.scene.add(particles.emitter)

    const ball = { mesh, body: { ...body }, particleSystem: particles.emitter }
    this.balls.push(ball)

    body.addEventListener('collide', (event) => {
      if (event.body.id !== this.socket.id) {
        this.handleCollision(ball, event)
      }
    })
    this.cleanUp(ball, 3)
  }

  initParticleSystem() {
    return new ParticleSystem({
      duration: 1,
      looping: true,
      startLife: new IntervalValue(0.3, 0.1),
      startSpeed: new IntervalValue(1, 1),
      startSize: new IntervalValue(0.1, 0.1),
      startColor: new RandomColor(
        new THREE.Vector4(1, 0.2, 0, 1), // Deep red
        new THREE.Vector4(1, 1, 0, 1) // Bright yellow
      ),
      worldSpace: true,
      maxParticle: 2000,
      emissionOverTime: new ConstantValue(2000),
      shape: new PointEmitter(),
      material: new THREE.PointsMaterial({
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthTest: false
      }),
      startTileIndex: new ConstantValue(0),
      uTileCount: 10,
      vTileCount: 10,
      renderMode: RenderMode.BillBoard,
      renderOrder: 1
    })
  }

  handleCollision(ball, event) {
    const ev = { ...event }
    if (ev.body.id.includes('player')) {
      this.dmgParticles = this.initParticleSystem()
      // Set the position of the particle system to the position of the ball
      this.dmgParticles.emitter.position.copy(ball.body.position)

      this.dmgParticles.emitterShape = new SphereEmitter({
        radius: 3,
        thickness: 3,
        arc: Math.PI * 2
      })

      this.batchSystem.addSystem(this.dmgParticles)

      // Add the particle system to the scene
      this.scene.add(this.dmgParticles.emitter)

      setTimeout(() => {
        this.scene.remove(this.dmgParticles.emitter)
      }, 100)
    }

    this.cleanUp(ball, 0)
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
