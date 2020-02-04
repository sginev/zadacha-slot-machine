import * as Phaser from "phaser"

class MainScene extends Phaser.Scene 
{
  private state = new class 
  {
    coins:number = 0
    reelRows:[number,number,number] = [ 0, 0, 0 ]
  }

  private sprites = new class 
  {
    background:Phaser.GameObjects.Sprite
    reels = new class 
    {
      container:Phaser.GameObjects.Container
      background:Phaser.GameObjects.Sprite
      symbolStrips:[Phaser.GameObjects.Container,Phaser.GameObjects.Container,Phaser.GameObjects.Container]
    }
    lever:Phaser.GameObjects.Sprite
  }

  constructor() 
  {
    super( { key: "MainScene" } )
  }

  preload() : void 
  {
    this.load.image( "background", "assets/slot_machine/slot_machine_background.png" )
    this.load.image( "reels", "assets/slot_machine/slot_machine_reels.png" )
    range( 10 ).forEach( i => this.load.image( 'lever_' + i, `assets/hand_lever/hand_lever_frame_${ i + 1 }.png` ) )
    range( 5 ).forEach( i => this.load.image( 'symbol_' + i, `assets/symbols/icon_${ i + 1 }.png` ) )
  }

  create() : void 
  {
    const center = {
      x : this.cameras.main.centerX, 
      y : this.cameras.main.centerY,
    }

    //// REELS
    this.sprites.reels.container = this.add.container( center.x - 34, center.y + 7 )    
    this.sprites.reels.background = this.add.sprite( 0, 0, "reels" )
    this.sprites.reels.container.add( this.sprites.reels.background )
    this.sprites.reels.symbolStrips = [
      this.add.container( -140, 0 ) ,
      this.add.container(    0, 0 ) ,
      this.add.container(  140, 0 ) ,
    ]
    this.sprites.reels.symbolStrips.forEach( reel => {
      const count = 5
      const delta = 110
      reel.add( range( count ).map( i => this.add.image( 0, delta * i, 'symbol_' + i ) ) )
      reel.add( range( count ).map( i => this.add.image( 0, delta * ( i - count ), 'symbol_' + i ) ) )
      reel.add( range( count ).map( i => this.add.image( 0, delta * ( i - count - count ), 'symbol_' + i ) ) )      
      this.sprites.reels.container.add( reel )
    } )

    //// MACHINE
    //this.sprites.background = this.add.sprite( center.x, center.y, "background" )

    //// LEVER
    this.anims.create( {
        key: 'pull', 
        repeat: 0,
        yoyo: true,
        frameRate: 30 ,
        frames: range( 10 ).map( i => ( { key : 'lever_' + i, frame : 0 } ) ),
    } )
    this.sprites.lever = this.add.sprite( center.x + 330, center.y - 50, 'lever_0' )
    this.sprites.lever.setInteractive( { useHandCursor: true  } )
    this.sprites.lever.on('pointerdown', pointer => this.pull() )
    this.sprites.lever.on('pointerout', function (pointer) { this.clearTint() } )
    this.sprites.lever.on('pointerup', function (pointer) { this.clearTint() } )
  }

  update() 
  {
    
  }

  setReelRow( reel_index:number, row:number ) 
  {
    const count = 5
    const delta = 110

    /// Normalize row to between 0 and 5
    while ( row > count ) row -= count
    while ( row < 0 ) row += count

    this.sprites.reels.symbolStrips[ reel_index ].y = row * delta
  }

  pull() 
  {
    this.sprites.lever.play( 'pull' )

    this.setReelRow( 0, ~~( Math.random() * 50 ) )
    this.setReelRow( 1, ~~( Math.random() * 50 ) )
    this.setReelRow( 2, ~~( Math.random() * 50 ) )
  }

  ____debug____SetDraggable( target:Phaser.GameObjects.GameObject ) 
  {
    target.setInteractive()
    this.input.setDraggable( target )
    this.input.on('dragstart', function (pointer, gameObject) { gameObject.setTint(0xff0000); })
    this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
        gameObject.x = dragX;
        gameObject.y = dragY;
        console.log( dragX - this.cameras.main.centerX, dragY - this.cameras.main.centerY )
    })
    this.input.on('dragend', function (pointer, gameObject) { gameObject.clearTint() })
  }
}

const range = length => [ ...Array( length ).keys() ]

export default MainScene