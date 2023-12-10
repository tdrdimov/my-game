import * as THREE from 'three'

export default class AudioController {
  static sounds = []

  constructor(params) {
    this.camera = params.camera
    this.scene = params.scene
    this.listener = new THREE.AudioListener()
    this.audioLoader = new THREE.AudioLoader()
    this._Init()
  }

  _Init() {
    this.camera.add(this.listener)
  }

  play(position, path, loop, speed = 1.0) {
    const existingSound = AudioController.sounds.find((sound) => sound.name === path)

    if (!existingSound) {
      this.audioLoader.load(path, (buffer) => {
        const positionalAudio = new THREE.PositionalAudio(this.listener)

        positionalAudio.setBuffer(buffer)

        positionalAudio.setPlaybackRate(speed)

        positionalAudio.loop = loop

        positionalAudio.setVolume(10)

        const audioObject = new THREE.Object3D()
        audioObject.position.copy(position)

        audioObject.add(positionalAudio)

        this.scene.add(audioObject)

        positionalAudio.play()
        positionalAudio.name = path
        AudioController.sounds.push(positionalAudio)
      })
    } else if (!existingSound.isPlaying) {
      existingSound.play()
    }
  }

  stop(name) {
    const sound = AudioController.sounds.find((sound) => sound.name === name)
    if (sound) {
      sound.stop()
      this.scene.remove(sound.userData.audioObject)
      const index = AudioController.sounds.indexOf(sound)
      AudioController.sounds.splice(index, 1)
    }
  }
}
