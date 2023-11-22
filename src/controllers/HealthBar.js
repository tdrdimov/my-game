import * as THREE from 'three'

class HealthBar {
  constructor(scene, initialHealth, entityPosition) {
    const material = new THREE.LineBasicMaterial({
      color: 0x00ff00,
      depthTest: false,
      lineWidth: 2
    }) // Green color
    const maxHealthMaterial = new THREE.LineBasicMaterial({
      color: 0xff0000,
      depthTest: false,
      lineWidth: 2
    }) // Red color

    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(0, 0, 0)
    ])

    this.line = new THREE.Line(geometry, material)
    this.line.position.copy(entityPosition)
    this.line.position.y += 22 // Adjust this value to position the health bar above the entity
    this.line.position.x += 5.5
    this.line.renderOrder = 1
    scene.add(this.line)

    this.maxHealthLine = new THREE.Line(geometry, maxHealthMaterial)
    this.maxHealthLine.position.copy(entityPosition)
    this.maxHealthLine.position.y += 22 // Adjust this value to position the max health bar above the entity
    this.maxHealthLine.position.x += 5.5
    this.maxHealthLine.renderOrder = 0
    scene.add(this.maxHealthLine)

    this.health = initialHealth
    this.maxHealthLine.scale.x = this.health / 10
    this.updateScale()
  }

  updateHealth(newHealth) {
    this.health = newHealth
    this.updateScale()
  }

  updateScale() {
    this.line.scale.x = this.health / 10 // Adjust this value based on the maximum health
  }

  updatePosition(entityPosition) {
    this.line.position.copy(entityPosition)
    this.line.position.y += 22 // Adjust this value to position the health bar above the entity
    this.line.position.x += 5.5 // Adjust this value to center the health bar
    this.maxHealthLine.position.copy(entityPosition)
    this.maxHealthLine.position.y += 22 // Adjust this value to position the max health bar above the entity
    this.maxHealthLine.position.x += 5.5
  }
}

export default HealthBar
