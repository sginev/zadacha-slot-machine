import SLOTS from "./settings-slots.json"

type MatchType = 'trio' | 'pair' | 'none'

interface SymbolData {
  weight : number
  reward : SpinReward
  index? : number
}

interface SpinReward {
  coins : number
}

interface SpinResult {
  match : MatchType
  symbols : [number,number,number]
  reward : SpinReward
}

const getWeightedRandomItem = <T>( list:T[], weights:number[] ) : T => 
{
  let total_weight = weights.reduce( ( prev, cur, i, arr ) => prev + cur )

  let random_num = Math.random() * total_weight
  let weight_sum = 0

  for ( let i = 0; i < list.length; i++ ) 
  {
    weight_sum += weights[i]
    weight_sum = +weight_sum.toFixed(2)
      
    if ( random_num <= weight_sum ) 
      return list[ i ]
  }
}

const slots = new class {
    public makeSpinResult () : SpinResult
    {
      const symbols = SLOTS.symbols.map( ( symbol, i ) => { return { index : i, ...symbol } } )
    
      const getRandomSymbol = ( weighted:boolean ) => {
        const i = ! weighted ? ~~( Math.random() * symbols.length ) :
                  getWeightedRandomItem( symbols.map( ( symbol, i:number ) => i ), 
                                         symbols.map( symbol => symbol.weight ) )
        const symbol = symbols[ i ]                       
        symbols.splice( i, 1 )
        return symbol
      }
    
      const symbolsToShuffledIndices = ( symbols:[SymbolData,SymbolData,SymbolData] ) =>
        symbols
          .sort( () => Math.random() - 0.5 )
          .sort( () => Math.random() - 0.5 )
          .sort( () => Math.random() - 0.5 )
          .sort( () => Math.random() - 0.5 ) //// quick and dirty shuffling
          .map( symbol => symbol.index ) as [ number, number, number ]
    
      const match = getWeightedRandomItem( Object.keys( SLOTS.weights ), 
                                           Object.values( SLOTS.weights ) ) as MatchType
    
      const result = { match }
    
      if ( match === 'none' )
      {
        let symbol_1 = getRandomSymbol( false )
        let symbol_2 = getRandomSymbol( false )
        let symbol_3 = getRandomSymbol( false )
        return {
          ...result, 
          symbols : symbolsToShuffledIndices( [ symbol_1, symbol_2, symbol_3 ] ) ,
          reward : null ,
        }
      }
    
      if ( match === 'pair' )
      {
        let symbol_1 = getRandomSymbol( true )    
        let symbol_2 = getRandomSymbol( false )    
        return {
          ...result, 
          symbols : symbolsToShuffledIndices( [ symbol_1, symbol_1, symbol_2 ] ) ,
          reward : null ,
        }
      }
    
      if ( match === 'trio' )
      {
        let symbol = getRandomSymbol( true )    
        return {
          ...result,
          symbols : symbolsToShuffledIndices( [ symbol, symbol, symbol ] ),
          reward : symbol.reward ,
        }
      }
    
      throw new Error( `Invalid configuration - unrecognized match type ${ match }` )
    }
}

export default slots