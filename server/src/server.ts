import SERVER_CONFIG from "./settings-server.json"
import express from "express"
import slots from "./slots"

const app = express()

app.get( "/spin", ( req, res ) => {
  const result = slots.makeSpinResult()
  const json = JSON.stringify( result )
  res.send( json )
} )

app.get( "/debug", ( req, res ) => {
  let s = ''
  for ( let i = 0 ; i < 100 ; i++ ) {
    const result = slots.makeSpinResult()
    s += `</br> <b>${ result.match }</b> - ${ result.symbols.map( o => ` - ${ o } - ` ) }`
  }
  res.send( s )
} )

const PORT = process.env.PORT || SERVER_CONFIG.port
app.listen( PORT, () => console.log( `Slots API Server listening on port ${ PORT }` ) )