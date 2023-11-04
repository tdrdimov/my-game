// Lights.js
import * as THREE from 'three'

export class Canvas {
  constructor(camera) {
    this._CreateCanvas()
    this._camera = camera
  }

  _CreateCanvas() {
    this._threejs = new THREE.WebGLRenderer({
      antialias: true
    })
    this._threejs.outputColorSpace = THREE.SRGBColorSpace
    this._threejs.shadowMap.enabled = true
    this._threejs.shadowMap.type = THREE.PCFSoftShadowMap
    this._threejs.setPixelRatio(window.devicePixelRatio)
    this._threejs.setSize(window.innerWidth, window.innerHeight)

    document.body.appendChild(this._threejs.domElement)

    window.addEventListener(
      'resize',
      () => {
        this._OnWindowResize()
      },
      false
    )
    return this._threejs
  }

  _OnWindowResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight
    this._camera.updateProjectionMatrix()
    this._threejs.setSize(window.innerWidth, window.innerHeight)
  }
}
