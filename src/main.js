import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { BasicCharacterController } from './controllers/CharacterController.js'
import BoxGenerator from './generators/BoxGenerator.js'
import * as CANNON from 'cannon'

class World {
  constructor() {
    this._Initialize()
  }

  _Initialize() {
    this._threejs = new THREE.WebGLRenderer({
      antialias: true
    })
    this._threejs.outputEncoding = THREE.sRGBEncoding
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

    const fov = 60
    const aspect = window.innerWidth / window.innerHeight
    const near = 1.0
    const far = 1000.0
    this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
    this._camera.position.set(25, 10, 25)
    this.world = new CANNON.World()
    this._scene = new THREE.Scene()
    this.boxGenerator = new BoxGenerator(this._scene, this.world)

    let light = new THREE.DirectionalLight(0xffffff, 1.0)
    light.position.set(-200, 200, 200)
    light.target.position.set(0, 0, 0)
    light.castShadow = true
    light.shadow.bias = -0.001
    light.shadow.mapSize.width = 4096
    light.shadow.mapSize.height = 4096
    light.shadow.camera.near = 0.1
    light.shadow.camera.far = 500.0
    light.shadow.camera.near = 0.5
    light.shadow.camera.far = 500.0
    light.shadow.camera.left = 50
    light.shadow.camera.right = -50
    light.shadow.camera.top = 50
    light.shadow.camera.bottom = -50
    this._scene.add(light)

    light = new THREE.AmbientLight(0xffffff, 2.25)
    this._scene.add(light)

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200, 20, 20),
      new THREE.MeshStandardMaterial({
        color: 0x808080
      })
    )
    plane.castShadow = false
    plane.receiveShadow = true
    plane.rotation.x = -Math.PI / 2
    this._scene.add(plane)

    
    this.world.gravity.set(0, -9.81, 0)

    const groundShape = new CANNON.Plane()
    const groundBody = new CANNON.Body({ mass: 0 })
    groundBody.addShape(groundShape)
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    this.world.addBody(groundBody)

    // Create boxes using the box generator
    this.boxGenerator.createBox(0, 0, 0)
    this.boxGenerator.createBox(20, 0, 0)
    this.boxGenerator.createBox(40, 0, 0)
      
    this._mixers = []
    this._previousRAF = null

    this._LoadAnimatedModel()
    this._RAF()
  }

  _LoadAnimatedModel() {
    const params = {
      camera: this._camera,
      scene: this._scene,
      renderer: this._threejs
    }
    this._controls = new BasicCharacterController(params)
  }

  _LoadAnimatedModelAndPlay(path, modelFile, animFile, offset) {
    const loader = new FBXLoader()
    loader.setPath(path)
    loader.load(modelFile, (fbx) => {
      fbx.scale.setScalar(0.1)
      fbx.traverse((c) => {
        c.castShadow = true
      })
      fbx.position.copy(offset)

      const anim = new FBXLoader()
      anim.setPath(path)
      anim.load(animFile, (anim) => {
        const m = new THREE.AnimationMixer(fbx)
        this._mixers.push(m)
        const idle = m.clipAction(anim.animations[0])
        idle.play()
      })
      this._scene.add(fbx)
    })
  }

  _OnWindowResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight
    this._camera.updateProjectionMatrix()
    this._threejs.setSize(window.innerWidth, window.innerHeight)
  }

  _RAF() {
    requestAnimationFrame((t) => {
      if (this._previousRAF === null) {
        this._previousRAF = t
      }

      this._RAF()
      this.world.step(t);
      this._threejs.render(this._scene, this._camera)
      this._Step(t - this._previousRAF)
      this._previousRAF = t
    })
  }

  _Step(timeElapsed) {
    const timeElapsedS = timeElapsed * 0.001
    if (this._mixers) {
      this._mixers.map((m) => m.update(timeElapsedS))
    }

    if (this._controls) {
      this._controls.Update(timeElapsedS)
    }
  }
}

let _APP = null

window.addEventListener('DOMContentLoaded', () => {
  _APP = new World()
})
