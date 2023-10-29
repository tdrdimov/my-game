import * as THREE from 'three';
import { Game } from './game';

const game = new Game();

function animate() {
  game.update();
  game.render();
  requestAnimationFrame(animate);
}

animate();

