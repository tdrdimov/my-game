import * as THREE from 'three'
import { GLTFLoaderClass } from './GLTFLoader'

export class Scene {
  constructor() {
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    this.camera.position.set(0, 2, 5)
    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(this.renderer.domElement)

    this.michelle = new GLTFLoaderClass(this.scene)
    this.floor = this.createFloor()

    this.scene.add(this.floor)
  }

  createFloor() {
    const floorGeometry = new THREE.PlaneGeometry(100, 100)
    const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x888888, side: THREE.DoubleSide })
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = Math.PI / 2
    floor.position.y = -1
    return floor
  }

  async loadModel() {
    await this.michelle.loadGLTFModel('../models/michelle_idle.gltf');
  }

  update() {
    // Additional scene updates
    // ...
    // this.michelle.playAnimation('idle_anim')
  }

  render() {
    this.renderer.render(this.scene, this.camera)
  }
}
