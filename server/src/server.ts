import SETTINGS_SERVER from "./settings-server.json"
import SETTINGS_SLOTS from "./settings-slots.json"
import express from "express"
import session from "express-session"
import cors from "cors"
import slots from "./slots"

const app = express()

class UserData {
  spins = 0
  constructor ( public coins : number ) {}
}

app.use( cors() )
app.use( session( {
  secret: SETTINGS_SLOTS.user.session.secret,
  cookie: { maxAge: SETTINGS_SLOTS.user.session.cookieMaxAge },
  saveUninitialized: false ,
  resave: false ,
} ) )

app.use( ( req, res ) => {
  if ( ! req.session.user ) {
    req.session.user = new UserData( SETTINGS_SLOTS.user.initialCoins )
  }
  req.next()
} )

app.get( "/init", ( req, res ) => {
  res.json( { 
    symbols : SETTINGS_SLOTS.symbols , 
    user : req.session.user
  } )
} )

app.get( "/spin", ( req, res ) => {
  const user = req.session.user as UserData
  user.spins++
  user.coins--

  const result = slots.makeSpinResult()
  if ( result.reward )
    user.coins += result.reward.coins

  res.json( { result , user } )
} )

const PORT = process.env.PORT || SETTINGS_SERVER.port
app.listen( PORT, () => console.log( `Slots API Server listening on port ${ PORT }` ) )