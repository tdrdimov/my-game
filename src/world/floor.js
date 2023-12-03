import * as CANNON from 'cannon-es'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export class Floor {
  constructor(
    scene,
    cannon,
    position = new THREE.Vector3(0, 0, 0),
    planeWidth = 100,
    planeHeight = 100,
    underfloor = false
  ) {
    this._scene = scene
    this._world = cannon._world
    this._CreateFloor(position, planeWidth, planeHeight, underfloor)
    this._AddDecor()
  }

  _CreateFloor(position, planeWidth, planeHeight, underfloor) {
    const extensionRadius = 20

    const textureLoader = new THREE.TextureLoader()
    const texture = textureLoader.load('./stone-floor.jpg')
    const specularTexture = textureLoader.load('./SpecularMap.jpg')
    const normalMapTexture = textureLoader.load('./NormalMap.jpg')
    const displacementMapTexture = textureLoader.load('./DisplacementMap.jpg')
    const ambientOcclusionTexture = textureLoader.load('./AmbientOcclusionMap.jpg')

    const repeat = 24
    const repeatFunction = (texture) => {
      texture.wrapS = THREE.RepeatWrapping
      texture.wrapT = THREE.RepeatWrapping
      texture.repeat.set(repeat, repeat)
    }
    const texture1 = textureLoader.load('./Water_001_COLOR.jpg')
    repeatFunction(texture1)

    const specularTexture1 = textureLoader.load('./Water_001_SPEC.jpg')
    repeatFunction(specularTexture1)

    const normalMapTexture1 = textureLoader.load('./Water_001_NORM.jpg')
    repeatFunction(normalMapTexture1)

    const displacementMapTexture1 = textureLoader.load('./Water_001_DISP.png')
    repeatFunction(displacementMapTexture1)

    const ambientOcclusionTexture1 = textureLoader.load('./Water_001_OCC.jpg')
    repeatFunction(ambientOcclusionTexture1)

    const planeGeometry = new THREE.CircleGeometry(planeWidth, planeHeight, 5, 32)
    const extensionGeometry = new THREE.CircleGeometry(extensionRadius, 32)

    const planeMaterial = new THREE.MeshStandardMaterial({
      color: underfloor ? 0x111937 : 0x888888,
      map: underfloor ? texture1 : texture,
      specularMap: underfloor ? specularTexture1 : specularTexture,
      normalMap: underfloor ? normalMapTexture1 : normalMapTexture,
      displacementMap: underfloor ? displacementMapTexture1 : displacementMapTexture,
      aoMap: underfloor ? ambientOcclusionTexture1 : ambientOcclusionTexture,
      side: THREE.BackSide,
      transparent: true,
      opacity: 1,
      metalness: underfloor ? 0.8 : 0.2, // Adjust as needed
      roughness: underfloor ? 0.2 : 0.6
    })
    const plane = new THREE.Mesh(planeGeometry, planeMaterial)
    plane.name = 'floor'
    plane.castShadow = false
    plane.receiveShadow = true
    plane.rotation.x = Math.PI / 2
    plane.position.set(position.x, position.y, position.z)

    const extension1 = new THREE.Mesh(extensionGeometry, planeMaterial)
    const extension2 = new THREE.Mesh(extensionGeometry, planeMaterial)

    // Position the extensions on either side of the floor
    extension1.position.set(planeWidth, 0, 0)
    extension2.position.set(-planeWidth, 0, 0)

    this._scene.add(plane)

    const floorShape = new CANNON.Box(new CANNON.Vec3(planeWidth, planeHeight, 0.5))
    const floorBody = new CANNON.Body()
    floorBody.mass = 0
    floorBody.addShape(floorShape)
    floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5)
    floorBody.position.copy(plane.position)
    this._world.addBody(floorBody)
  }

  _AddDecor() {
    const loader = new GLTFLoader()
    loader.load(
      '/models/banner.glb', // Replace with the path to your decor FBX file
      (glb) => {
        const model = glb.scene
        // Adjust the position, rotation, and scale of the decor model
        model.position.set(0, 0, 0)
        model.rotation.y = Math.PI
        // model.rotation.z = Math.PI / 2
        model.scale.set(5, 5, 5)

        // Add the decor model to the scene
        this._scene.add(model)
      },
      (xhr) => {
        // Loading progress callback
        // console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
      },
      (error) => {
        console.error('Error loading decor FBX model:', error)
      }
    )
  }
}
