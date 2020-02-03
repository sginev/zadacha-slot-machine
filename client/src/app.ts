import * as Phaser from "phaser"

const config = {
  parent: "game",
  title: "Задача Slots",
  width: 800,
  height: 1280,
  backgroundColor: "#18216D"
}

export class SlotsGame extends Phaser.Game {
  constructor( config ) {
    super( config )
  }
}

window.onload = () => {
  var game = new SlotsGame(config)
}