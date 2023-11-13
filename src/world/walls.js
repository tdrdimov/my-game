import * as CANNON from 'cannon-es'
import * as THREE from 'three'

export class Walls {
  constructor(scene, cannon) {
    this._scene = scene
    this._world = cannon._world
    this._CreateWalls()
  }

  _CreateWalls() {
    const planeWidth = 300
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
    wallBody.position.set(0, wallHeight / 2, 0)
    this._world.addBody(wallBody)
  }
}
