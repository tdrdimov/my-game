import * as THREE from 'three'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import { MeshLine, MeshLineMaterial } from 'three.meshline'
class HealthBar {
  constructor(scene, initialHealth, entity, camera, playerName) {
    this.camera = camera
    this.entity = entity
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(1, 0, 0)
    ])

    const line = new MeshLine()
    line.setGeometry(lineGeometry)

    const material = new MeshLineMaterial({
      color: new THREE.Color(0x6acf48),
      depthTest: false,
      lineWidth: 0.7
    })

    this.line = new THREE.Mesh(line.geometry, material)
    this.line.position.copy(this.entity.position)
    this.line.renderOrder = 1
    scene.add(this.line)

    const maxHealthLine = new MeshLine()
    maxHealthLine.setGeometry(lineGeometry)

    const maxHealthMaterial = new MeshLineMaterial({
      color: new THREE.Color(0xd1d5db),
      lineWidth: 0.7
    })

    this.maxHealthLine = new THREE.Mesh(maxHealthLine.geometry, maxHealthMaterial)
    this.maxHealthLine.position.copy(this.entity.position)
    scene.add(this.maxHealthLine)

    this.health = initialHealth
    this.maxHealthLine.scale.x = this.health / 10
    this.updateScale()

    const loader = new FontLoader()
    this.textGeometry = null
    loader.load('/fonts/zilla_slab_regular.json', (font) => {
      if (font) {
        this.textGeometry = new TextGeometry(playerName, {
          font: font,
          size: 1.5,
          height: 0.1
        })
        this.textGeometry.computeBoundingBox()

        const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
        this.textLabel = new THREE.Mesh(this.textGeometry, textMaterial)
        this.textLabel.position.copy(this.entity.position)

        this.textLabel.onBeforeRender = function (
          renderer,
          scene,
          camera,
          geometry,
          material,
          group
        ) {
          const quaternion = camera.quaternion
          this.quaternion.copy(quaternion)
        }

        scene.add(this.textLabel)
      }
    })
  }

  updateHealth(newHealth) {
    this.health = newHealth
    const newLength = this.health / 10

    // Update the texture coordinates
    const uv = this.line.geometry.attributes.uv.array
    uv[2] = newLength // Adjust the x-coordinate of the second point

    // Update the buffer geometry
    this.line.geometry.attributes.uv.needsUpdate = true
    this.updateScale()
  }

  updateScale() {
    this.line.scale.x = this.health / 10
  }

  updatePosition(entityPosition) {
    const newPosition = (offset, height) => new THREE.Vector3(offset, height, 0)
    // Calculate the centerOffset for the maxHealthLine
    let maxHealthLineWidth = this.maxHealthLine.scale.x
    let maxHealthLineCenterOffset = maxHealthLineWidth / 2

    this.line.position.copy(entityPosition).add(newPosition(maxHealthLineCenterOffset, 22))
    this.maxHealthLine.position.copy(entityPosition).add(newPosition(maxHealthLineCenterOffset, 22))

    // Set the rotation to the inverse of the camera's rotation
    this.line.quaternion.copy(this.camera.quaternion).invert()
    this.maxHealthLine.quaternion.copy(this.camera.quaternion).invert()

    // Calculate the centerOffset for the textLabel
    if (this.textLabel && this.textLabel.geometry) {
      const bndBox = this.textLabel.geometry.boundingBox
      this.textLabel.geometry.computeBoundingBox()
      let textWidth = bndBox.max.x - bndBox.min.x
      let textLabelCenterOffset = textWidth / 2
      this.textLabel.position.copy(entityPosition).add(newPosition(textLabelCenterOffset, 26))
      this.textLabel.quaternion.copy(this.camera.quaternion).invert()
    }

    
  }
}

export default HealthBar
