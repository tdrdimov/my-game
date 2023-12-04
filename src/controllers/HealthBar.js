import * as THREE from "three";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { MeshLine, MeshLineMaterial } from "three.meshline";
class HealthBar {
  constructor(scene, initialHealth, entityPosition, camera) {
    this.camera = camera;
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(0, 0, 0),
    ]);

    const line = new MeshLine();
    line.setGeometry(lineGeometry);

    const material = new MeshLineMaterial({
      color: new THREE.Color(0x6acf48),
      depthTest: false,
      lineWidth: 0.7,
    });

    this.line = new THREE.Mesh(line.geometry, material);
    this.line.position.copy(entityPosition);
    this.line.renderOrder = 1;
    scene.add(this.line);

    const maxHealthLine = new MeshLine();
    maxHealthLine.setGeometry(lineGeometry);

    const maxHealthMaterial = new MeshLineMaterial({
      color: new THREE.Color(0xd1d5db),
      lineWidth: 0.7,
    });

    this.maxHealthLine = new THREE.Mesh(
      maxHealthLine.geometry,
      maxHealthMaterial
    );
    this.maxHealthLine.position.copy(entityPosition);
    scene.add(this.maxHealthLine);

    this.health = initialHealth;
    this.maxHealthLine.scale.x = this.health / 10;
    this.updateScale();

    const loader = new FontLoader();
    this.textGeometry = null;
    loader.load("/fonts/name_font.typeface.json", (font) => {
      this.textGeometry = new TextGeometry("Crazy Biatch", {
        font: font,
        size: 1.5,
        height: 0.1,
      });
      if (this.textGeometry) {
        this.textGeometry.computeBoundingBox();

        const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.textLabel = new THREE.Mesh(this.textGeometry, textMaterial);
        this.textLabel.position.copy(entityPosition);

        this.textLabel.onBeforeRender = function (
          renderer,
          scene,
          camera,
          geometry,
          material,
          group
        ) {
          const quaternion = camera.quaternion;
          this.quaternion.copy(quaternion);
        };

        scene.add(this.textLabel);
      }
    });
  }

  updateHealth(newHealth) {
    this.health = newHealth;
    this.updateScale();
  }

  updateScale() {
    this.line.scale.x = this.health / 10;
  }

  updatePosition(entityPosition) {
    this.textGeometry.computeBoundingBox();
    const quaternion = this.camera.quaternion;
    const boundingBox = this.textGeometry.boundingBox;
    const textWidth = boundingBox.max.x - boundingBox.min.x;
    const centerOffset = textWidth / 2;
    
    this.line.position.copy(entityPosition);
    this.line.position.y = 22;
    this.line.position.x = entityPosition.x - centerOffset;
    
    this.maxHealthLine.position.copy(entityPosition);
    this.maxHealthLine.position.y = 22;
    this.maxHealthLine.position.x = entityPosition.x - centerOffset;

    this.line.quaternion.copy(quaternion);
    this.maxHealthLine.quaternion.copy(quaternion);
    
    this.textLabel.position.copy(entityPosition);
    this.textLabel.position.y = 26;
    this.textLabel.position.x = entityPosition.x - centerOffset
    this.textLabel.quaternion.copy(quaternion);
  }
}

export default HealthBar;
