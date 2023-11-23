import * as THREE from 'three'
import { MeshLine, MeshLineMaterial } from 'three.meshline'
class HealthBar {
  constructor(scene, initialHealth, entityPosition) {
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(0, 0, 0)
    ])

    const line = new MeshLine()
    line.setGeometry(lineGeometry)

    const material = new MeshLineMaterial({
      color: new THREE.Color(0x00ff00),
      depthTest: false,
      lineWidth: 0.7 // Adjust this value to change the thickness of the line
    }) // Green color

    this.line = new THREE.Mesh(line.geometry, material)
    this.line.position.copy(entityPosition)
    this.line.position.y += 22 // Adjust this value to position the health bar above the entity
    this.line.position.x += 5.5
    this.line.renderOrder = 1
    scene.add(this.line)

    const maxHealthLine = new MeshLine()
    maxHealthLine.setGeometry(lineGeometry)

    const maxHealthMaterial = new MeshLineMaterial({
      color: new THREE.Color(0xff0000),
      lineWidth: 0.7 // Adjust this value to change the thickness of the line
    }) // Red color

    this.maxHealthLine = new THREE.Mesh(maxHealthLine.geometry, maxHealthMaterial)
    this.maxHealthLine.position.copy(entityPosition)
    this.maxHealthLine.position.y += 22 // Adjust this value to position the max health bar above the entity
    this.maxHealthLine.position.x += 5.5
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
