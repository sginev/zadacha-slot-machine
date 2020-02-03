import express from "express"
import SLOTS from "./settings-slots.json"
import CONFIG from "./settings-server.json"

const app = express()

app.get( "/", (req, res) => {

  let s = ''

  for ( let i = 0 ; i < 100 ; i++ ) {
    s += '</br>' + makeSpinResult()
  }

  res.send( s )
} )

const PORT = process.env.PORT || CONFIG.port
app.listen( PORT, () => console.log( `Slots API Server listening on port ${PORT}` ) )


//// -- //// -- ////


interface SymbolData {
  name : string
  icon : string
  weight : number
  reward : SpinReward
}

interface SpinReward {
  coins : number
}

interface SpinResult {
  reward : SpinReward
}


const makeSpinResult = () => 
{
  const symbols = SLOTS.symbols.slice()
  const getRandomSymbol = () : SymbolData => {
    const i = getRandomItem( symbols, symbols.map( ( symbol, i ) => i ) )
    symbols.splice( i, 1 )
    return symbols[ i ]
  }

  const match = getRandomItem( Object.keys( SLOTS.weights ), Object.values( SLOTS.weights ) )

  if ( match === 'none' )
  {
    return 
  }

  if ( match === 'pair' )
  {
    let symbol_1 = getRandomSymbol()    
    return {
      symbols : [ symbol_1, symbol_1, symbol_1 ] ,
      reward : symbol_1.reward
    }
  }

  if ( match === 'trio' )
  {
    let symbol = getRandomSymbol()    
    return {
      symbols : [ symbol, symbol, symbol ] ,
      reward : symbol.reward
    }
  }

  throw new Error( `Invalid configuration - unrecognized match type ${ match }` )
}

const getRandomItem = ( list, weight ) => 
{
  let total_weight = weight.reduce( ( prev, cur, i, arr ) => prev + cur )
    
  let random_num = Math.random() * total_weight
  let weight_sum = 0

  for ( let i = 0; i < list.length; i++ ) 
  {
    weight_sum += weight[i]
    weight_sum = +weight_sum.toFixed(2)
      
    if ( random_num <= weight_sum ) {
      return list[ i ]
    }
  }
}