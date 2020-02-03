import express from "express"
import SLOTS from "./settings-slots.json"
import CONFIG from "./settings-server.json"

const app = express()

app.get( "/", (req, res) => {

  let s = ''

  for ( let i = 0 ; i < 100 ; i++ ) {
    const result = makeSpinResult()
    //console.log( result )
    s += `</br> <b>${ result.match }</b> - ${ result.symbols.map( o => o.name ) }`
  }

  res.send( s )
} )

const PORT = process.env.PORT || CONFIG.port
app.listen( PORT, () => console.log( `Slots API Server listening on port ${ PORT }` ) )


//// -- //// -- ////

type MatchType = 'trio' | 'pair' | 'none'
type ThreeSymbols = [SymbolData,SymbolData,SymbolData]

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
  match : MatchType
  symbols : ThreeSymbols
  reward : SpinReward
}


const makeSpinResult = () : SpinResult => 
{
  const symbols = SLOTS.symbols.slice()

  const getRandomSymbol = () : SymbolData => {
    const i = getWeightedRandomItem( symbols.map( ( symbol, i:number ) => i ), 
                                     symbols.map( symbol => symbol.weight ) )
    symbols.splice( i, 1 )
    return symbols[ i ]
  }

  const match = getWeightedRandomItem( Object.keys( SLOTS.weights ), 
                                       Object.values( SLOTS.weights ) ) as MatchType

  const result = { match }

  if ( match === 'none' )
  {
    let symbol_1 = getRandomSymbol()
    let symbol_2 = getRandomSymbol()
    let symbol_3 = getRandomSymbol()
    return {
      ...result, 
      symbols : simpleShuffle( [ symbol_1, symbol_2, symbol_3 ] ) ,
      reward : null ,
    }
  }

  if ( match === 'pair' )
  {
    let symbol_1 = getRandomSymbol()    
    let symbol_2 = getRandomSymbol()    
    return {
      ...result, 
      symbols : simpleShuffle( [ symbol_1, symbol_1, symbol_2 ] ) ,
      reward : null ,
    }
  }

  if ( match === 'trio' )
  {
    let symbol = getRandomSymbol()    
    return {
      ...result,
      symbols : [ symbol, symbol, symbol ] ,
      reward : symbol.reward ,
    }
  }

  throw new Error( `Invalid configuration - unrecognized match type ${ match }` )
}

const simpleShuffle = ( array:ThreeSymbols ) => array.sort( () => Math.random() - 0.5 )

const getWeightedRandomItem = <T>( list:T[], weight:number[] ) : T => 
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