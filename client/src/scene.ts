import * as Phaser from "phaser"
import CONFIG from "./configuration.json"
import BackendService from "./backend"

class MainScene extends Phaser.Scene 
{
  private backend = new BackendService( CONFIG.urlBase )

  private state = new class 
  {
    coins:number = 0
    reelRows = {
      '0' : 0 ,
      '1' : 0 ,
      '2' : 0 ,
    }    
  }

  private sprites = new class 
  {
    background:Phaser.GameObjects.Sprite
    lever:Phaser.GameObjects.Sprite
    reels = new class 
    {
      container:Phaser.GameObjects.Container
      background:Phaser.GameObjects.Sprite
      symbolStrips:[Phaser.GameObjects.Container,Phaser.GameObjects.Container,Phaser.GameObjects.Container]
    }
    ui = new class
    {
      coins:Phaser.GameObjects.Text
    }
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

  async create() 
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
    this.sprites.background = this.add.sprite( center.x, center.y, "background" )

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
    this.sprites.lever.on( 'pointerdown', async pointer => this.pull() )

    //// UI

    this.sprites.ui.coins = this.add.text( 10, 10, '--', { 
      fontSize: 64,
      fontFamily: 'calibri', 
      fontWeight: 'bolder',
      color : 'black' 
    } )

    //// randomize initial state
    this.state.reelRows[ '0' ] = ~~( Math.random() * 5 )
    this.state.reelRows[ '1' ] = ~~( Math.random() * 5 )
    this.state.reelRows[ '2' ] = ~~( Math.random() * 5 )

    const data = await this.backend.init()
    
    this.state.coins = data.user.coins
  }

  update() 
  {
    this.setReelRow( 0, this.state.reelRows[ '0' ] )
    this.setReelRow( 1, this.state.reelRows[ '1' ] )
    this.setReelRow( 2, this.state.reelRows[ '2' ] )

    const coinsText = `($) ${ ~~this.state.coins }`
    this.sprites.ui.coins.setText( coinsText )
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

  async pull() 
  {
    this.sprites.lever.play( 'pull' )    

    const data = await this.backend.spin()

    console.log( data )

    const nextRows = data.result.symbols
    const nextCoins = data.user.coins

    //// VISUALIZE PAYMENT
    
    this.tweens.killTweensOf( this.state )
    this.state.coins -= 1

    //// THE ANIMATION

    const MAX_DURATION = 3000
    const STEP = 400
    
    this.tweens.killTweensOf( this.state.reelRows )
    
    range( 3 ).forEach( i => this.tweens.add( {
        targets : this.state.reelRows,
        [i] : { start: this.state.reelRows[i] % 5, to: 500 + 5 - nextRows[i] },
        duration: MAX_DURATION + ( i - 2 ) * STEP,
        ease: 'Cubic.easeInOut',
    } ) )

    ////

    this.setMachineEnabled( false )

    await delay( MAX_DURATION + 100 )
    
    this.setMachineEnabled( true )
    this.tweens.killTweensOf( this.state )
    this.tweens.add( { targets : this.state, 'coins' : nextCoins, duration : 800 } )
  }

  setMachineEnabled( value:boolean ) {
    value 
      ? this.input.enable( this.sprites.lever )
      : this.input.disable( this.sprites.lever )
  }
}

const range = length => [ ...Array( length ).keys() ]

const delay = async time => await new Promise( resolve => setTimeout( resolve, time ) )

export default MainScene