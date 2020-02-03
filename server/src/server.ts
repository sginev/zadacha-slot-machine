import SETTINGS_SERVER from "./settings-server.json"
import SETTINGS_SLOTS from "./settings-slots.json"
import express from "express"
import slots from "./slots"
import session from "express-session"

const app = express()

const sessionSettings = {
  secret: SETTINGS_SLOTS.user.session.secret,
  cookie: { maxAge: SETTINGS_SLOTS.user.session.cookieMaxAge }
}
app.use( session( sessionSettings ) )

class UserData {
  spins = 0
  constructor ( public coins : number ) {}
}

app.get( "/spin", ( req, res ) => {
  if ( ! req.session.user )
    req.session.user = new UserData( SETTINGS_SLOTS.user.initialCoins )

  const user = req.session.user as UserData
  user.spins++
  user.coins--

  const result = slots.makeSpinResult()
  if ( result.reward )
    user.coins += result.reward.coins

  const json = JSON.stringify( { ...result , user } )
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

const PORT = process.env.PORT || SETTINGS_SERVER.port
app.listen( PORT, () => console.log( `Slots API Server listening on port ${ PORT }` ) )