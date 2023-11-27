import * as THREE from 'three'

export class Sky {
  constructor(scene) {
    this._scene = scene
    this._Initialize()
  }

  _Initialize() {
    // Create a basic geometry for the particles (for example, points in 3D space)
    this.particleGeometry = new THREE.BufferGeometry()

    const textureLoader = new THREE.TextureLoader()
    const sparkle = textureLoader.load('./sparkle.png')

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.2,
      map: sparkle,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.8,
      fog: true,
      alphaTest: 0.1
    })
    this.areaRange = 300
    // Add positions for the particles
    const particlePositions = new Float32Array(600 * 3) // number of particles
    for (let i = 0; i < particlePositions.length; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * (this.areaRange + this.areaRange) // X position
      particlePositions[i + 1] = (Math.random() - 0.5) * this.areaRange // Y position
      particlePositions[i + 2] = (Math.random() - 0.5) * (this.areaRange + 50) // Z position
    }

    // Add velocities for the particles
    const particleVelocities = new Float32Array(1000 * 3) // 1000 particles
    for (let i = 0; i < particleVelocities.length; i += 3) {
      particleVelocities[i] = (Math.random() - 0.5) * 0.1 // Increased X velocity for faster movement
      particleVelocities[i + 1] = -Math.random() * 0.02 // Y velocity (negative for falling down)
      particleVelocities[i + 2] = (Math.random() - 0.5) * 0.01 // Z velocity
    }

    this.particleGeometry.setAttribute('velocity', new THREE.BufferAttribute(particleVelocities, 3))

    this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    this.particleGeometry.attributes.position.needsUpdate = true // Tell Three.js to update the positions
    // Create the particle system
    const particles = new THREE.Points(this.particleGeometry, particleMaterial)

    // Add the particle system to the scene
    this._scene.add(particles)
  }

  Update() {
    const positions = this.particleGeometry.attributes.position.array
    const velocities = this.particleGeometry.attributes.velocity.array

    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += velocities[i] // Update X position
      positions[i + 1] += velocities[i + 1] // Update Y position
      positions[i + 2] += velocities[i + 2] // Update Z position

      // If the particle has fallen below the ground (Y position less than 0), reset it to the top
      if (positions[i + 1] < 1) {
        positions[i] = (Math.random() - 0.5) * (this.areaRange + this.areaRange) // X position
        positions[i + 1] = this.areaRange // Y position
        positions[i + 2] = (Math.random() - 0.5) * (this.areaRange + 50) // Z position
      }
    }

    this.particleGeometry.attributes.position.needsUpdate = true // Tell Three.js to update the positions
  }
}
