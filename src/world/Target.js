import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class Target {
  constructor(params) {
    this.params = params;
    this.meshes = [];
    this.bodies = [];
    this.init();
  }

  init() {
    const wallSizeX = 10; // Number of boxes in the X direction
    const wallSizeY = 6; // Number of boxes in the Y direction
    const boxSize = 5;   // Size of each box

    for (let i = 0; i < wallSizeX; i++) {
      for (let j = 0; j < wallSizeY; j++) {
        // Create the THREE.js box geometry and mesh
        const geometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
        const material = new THREE.MeshStandardMaterial({ color: 0xffccff });
        const mesh = new THREE.Mesh(geometry, material);

        // Create the Cannon.js box shape and body
        const shape = new CANNON.Box(new CANNON.Vec3(boxSize / 2, boxSize / 2, boxSize / 2));
        const body = new CANNON.Body({ mass: 1, shape });
        body.position.set(20 + i * boxSize * 1.1, 20 + j * boxSize * 1.1, 20); // Adjust the positions
        body.linearDamping = 0.1; // Optional: reduce the linear velocity damping on the box
        body.angularDamping = 0.1; // Optional: reduce the angular velocity damping on the box

        // Add the box mesh to the scene
        this.params.scene.add(mesh);

        // Add the box body to the Cannon.js world
        this.params.world.addBody(body);

        // Store the mesh and body for future updates
        this.meshes.push(mesh);
        this.bodies.push(body);
      }
    }
  }

  // Function to handle collisions with the boxes
  handleCollision() {
    // Implement the logic you want when the character spell collides with the boxes
    // For example, move the boxes when a collision occurs
    const force = new CANNON.Vec3(0, 1, 0); // Adjust the force as needed
    this.bodies.forEach((body) => {
      body.applyImpulse(force, body.position);
    });
  }

  // Update function to be called in your animation loop
  update() {
    // Synchronize the THREE.js meshes with the Cannon.js bodies
    this.meshes.forEach((mesh, index) => {
      mesh.position.copy(this.bodies[index].position);
      mesh.quaternion.copy(this.bodies[index].quaternion);
    });
  }
}
