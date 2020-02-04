import * as Phaser from "phaser"
import MainScene from "./scene"

const config = {
  parent: "game",
  title: "Задача Slots",
  width: 800,
  height: 1280,
  backgroundColor: "#18416D",
  type: Phaser.AUTO, 
  scene: MainScene
}

export class SlotsGame extends Phaser.Game {
  constructor( config ) { 
    super( config )
  }
}

window.onload = () => new SlotsGame( config )