import { World } from './world/world.js'

let _APP = null

window.addEventListener('DOMContentLoaded', () => {
  _APP = new World()
})
