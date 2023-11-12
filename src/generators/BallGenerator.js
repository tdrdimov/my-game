import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export default class BallGenerator {
  constructor(scene, cannon) {
    this.scene = scene;
    this._world = cannon._world;
    this.balls = [];
  }

  createBall(x, y, z, velocity) {
    const fireballMaterial = new THREE.MeshStandardMaterial({
      emissive: 0xff6600,
      emissiveIntensity: 1,
      color: 0xff3300,
    });

    const fireballGeometry = new THREE.SphereGeometry(2, 32, 32);
    const mesh = new THREE.Mesh(fireballGeometry, fireballMaterial);
    mesh.castShadow = true;
    mesh.position.set(x, y, z);
    this.scene.add(mesh);

    // Cannon.js body
    const shape = new CANNON.Sphere(2);

    const body = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(x, y, z),
      shape: shape,
      material: this._world.defaultMaterial,
    });

    body.linearDamping = 0.2;
    body.velocity.set(velocity.x, velocity.y, velocity.z);
    this._world.addBody(body);

    // Store the balls in the array for collision detection
    this.balls.push({ mesh, body });
  }

  update() {
    for (const ball of this.balls) {
      ball.mesh.position.copy(ball.body.position);
      ball.mesh.quaternion.copy(ball.body.quaternion);
    }
  }
}
