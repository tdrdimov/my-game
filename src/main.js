import { World } from './world/world.js'
import SocketClient from './sockets/SocketClient'
import * as THREE from 'three'
import { CannonWorld } from './world/cannonWorld'

let _APP = null
let _SOCKET = null

window.addEventListener('DOMContentLoaded', () => {
  const scene = new THREE.Scene()
  const fogColor = 0xfec3aba8
  const fogNear = 200
  const fogFar = 500

  scene.fog = new THREE.Fog(fogColor, fogNear, fogFar)

  const cannonWorld = new CannonWorld()
  _SOCKET = new SocketClient(scene, cannonWorld)
  _APP = new World(_SOCKET.getSocket(), scene, cannonWorld)
})

const createui = document.getElementById('create_game_ui')
const joinui = document.getElementById('join_game_ui')
const checkJoin = document.getElementById('check_join')
const checkCreate = document.getElementById('check_create')

checkJoin.addEventListener('click', (event) => {
  event.preventDefault()
  joinui.style.display = 'block'
  createui.style.display = 'none'
  event.target.parentNode.style.display = 'none'
})

checkCreate.addEventListener('click', (event) => {
  event.preventDefault()
  createui.style.display = 'block'
  joinui.style.display = 'none'
  event.target.parentNode.style.display = 'none'
})

document.querySelectorAll('.close').forEach((element) => {
  element.addEventListener('click', (event) => {
    event.preventDefault()
    checkCreate.parentNode.style.display = 'flex'
    checkJoin.parentNode.style.display = 'flex'
    createui.style.display = 'none'
    joinui.style.display = 'none'
  })
})
