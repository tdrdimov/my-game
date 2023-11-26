import * as CANNON from 'cannon-es'
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'

export class Walls {
  constructor(scene, cannon) {
    this._scene = scene
    this._world = cannon._world
    this._CreateWalls()
    this._AddDecor(0, -55, -100)
  }

  _CreateWalls() {
    const planeWidth = 200
    const wallHeight = 70

    // Create walls using LatheGeometry
    const points = [
      new THREE.Vector2(planeWidth / 2, 0),
      new THREE.Vector2(planeWidth / 2, wallHeight),
      new THREE.Vector2(-planeWidth / 2, wallHeight),
      new THREE.Vector2(-planeWidth / 2, 0)
    ]

    const textureLoader = new THREE.TextureLoader()
    const texture = textureLoader.load('./stone-wall.jpg')

    // Ensure texture repeats
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(10, 2)
    texture.encoding = THREE.sRGBEncoding

    const geometry = new THREE.LatheGeometry(points, 60)

    // Scale down the texture by adjusting the UV coordinates
    const uvScale = 1 // Adjust this value to scale the texture
    geometry.attributes.uv.array.forEach((uv, index) => {
      geometry.attributes.uv.array[index] *= uvScale
    })

    const material = new THREE.MeshStandardMaterial({
      color: 0x444444,
      map: texture
    })

    const walls = new THREE.Mesh(geometry, material)
    walls.rotation.x = Math.PI
    this._scene.add(walls)

    // Create wall physics body
    const wallShape = new CANNON.ConvexPolyhedron(
      points.map((point) => new CANNON.Vec3(point.x, point.y, 0))
    )

    const wallBody = new CANNON.Body({ mass: 0 })
    wallBody.addShape(wallShape)
    wallBody.position.set(0, 70 / 2, 0)
    this._world.addBody(wallBody)
  }

  _AddDecor(x, y, z) {
    const loader = new FBXLoader()
    loader.load(
      '/models/flag.fbx', // Replace with the path to your decor FBX file
      (fbx) => {
        // Adjust the position, rotation, and scale of the decor model
        fbx.position.set(x, y, z)
        fbx.rotation.x = Math.PI;
        fbx.rotation.z = Math.PI;
        fbx.scale.set(0.07, 0.07, 0.07)

        // Add the decor model to the scene
        this._scene.add(fbx)
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
