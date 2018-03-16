const express = require('express')
const app = express()
const http  = require('http').Server(app)
const io = require('socket.io')(http)
const port = process.env.PORT || 3000

const passport = require('passport')
const morgan       = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const session      = require('express-session');

app.use(morgan('dev'))
app.use(cookieParser())
app.use(bodyParser.urlencoded({
  extended: true
}))

app.use(session({secret: 'catshit', resave: true, saveUninitialized: false}))
app.use(passport.initialize())
app.use(passport.session())
app.set('view engine', 'ejs'); // set up ejs for templating

require('./config/passport')(passport); // pass passport for configuration
require('./app/routes.js')(app, passport)

io.on('connection', (socket) => {
  console.log(`${socket.id} user connected`)

  socket.on('disconnect', () => {
    console.log('user disconnected')
  })

  socket.on('message', (msg) => {
    socket.broadcast.emit('message', msg)
  })
})

http.listen(port, () => {
  console.log(`live on:${port}`)
})