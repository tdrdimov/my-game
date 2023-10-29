import * as THREE from 'three';
import { Controls } from './controls';
import { Scene } from './scene';

export class Game {
  constructor() {
    this.scene = new Scene();
    this.controls = null; // Initialize controls to null

    this.scene.loadModel().then(() => {
      this.controls = new Controls(this.scene.michelle, this.scene.camera);
      this.update();
    });
  }

  update() {
    this.controls?.handleInput();
    this.scene.update();
  }

  render() {
    this.scene.render();
  }
}
