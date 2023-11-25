import * as CANNON from 'cannon-es'
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'

export class Floor {
  constructor(scene, cannon) {
    this._scene = scene
    this._world = cannon._world
    this._CreateFloor()
    // this._AddDecor(0, -25, 0)
  }

  _CreateFloor() {
    const planeWidth = 150
    const planeHeight = 150

    const textureLoader = new THREE.TextureLoader()
    const texture = textureLoader.load('./stone-floor.jpg')
    const specularTexture = textureLoader.load('./SpecularMap.jpg')
    const normalMapTexture = textureLoader.load('./NormalMap.jpg')
    const displacementMapTexture = textureLoader.load('./DisplacementMap.jpg')
    const ambientOcclusionTexture = textureLoader.load('./AmbientOcclusionMap.jpg')

    const planeGeometry = new THREE.CircleGeometry(planeWidth, planeHeight, 5, 32)

    const planeMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      map: texture,
      specularMap: specularTexture,
      normalMap: normalMapTexture,
      displacementMap: displacementMapTexture,
      aoMap: ambientOcclusionTexture,
      side: THREE.BackSide
    })
    const plane = new THREE.Mesh(planeGeometry, planeMaterial)
    plane.name = 'floor'
    plane.castShadow = false
    plane.receiveShadow = true
    plane.rotation.x = Math.PI / 2
    this._scene.add(plane)

    const floorShape = new CANNON.Plane()
    const floorBody = new CANNON.Body()
    floorBody.mass = 0
    floorBody.addShape(floorShape)
    floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5)
    this._world.addBody(floorBody)
  }

  _AddDecor(x, y, z) {
    const loader = new FBXLoader()
    loader.load(
      '/models/ring.fbx',
      (fbx) => {
        fbx.position.set(x, y, z)
        fbx.scale.set(180, 180, 180)
        fbx.rotation.y = Math.PI * 0.5
        this._scene.add(fbx)
      },
      (xhr) => {
        // console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
      },
      (error) => {
        console.error('Error loading FBX model:', error)
      }
    )
  }
}
