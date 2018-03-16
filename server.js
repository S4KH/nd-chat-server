const express = require('express')
const app = express()
const http  = require('http').Server(app)
const session = require('express-session');
const io = require('socket.io')(http)
const port = process.env.PORT || 3000
const redis = require('redis')
const RedisStore = require('connect-redis')(session)
const rClient = redis.createClient({
  host: 'redis-18500.c9.us-east-1-4.ec2.cloud.redislabs.com',
  port: 18500,
  pass: "#####"
})
const sessionStore = new RedisStore({client: rClient})


const passport = require('passport')
const morgan       = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const sessionMiddleware = session({store: sessionStore, secret: 'catshit', resave: true, saveUninitialized: false})

app.use(morgan('dev'))
app.use(cookieParser())
app.use(bodyParser.urlencoded({
  extended: false
}))

app.use(sessionMiddleware)
app.use(passport.initialize())
app.use(passport.session())
app.set('view engine', 'ejs'); // set up ejs for templating

// Use express session for io
io.use((socket, next) => {
  sessionMiddleware(socket.request, socket.request.res, next)
})

// Config and routes
require('./config/passport')(passport); // pass passport for configuration
require('./app/routes.js')(app, passport)

io.on('connection', (socket) => {
  const user = socket.request.session.user
  console.log(user)
  if(!user) {
    socket.close()
  }
  console.log(`${socket.id} user connected`)

  socket.on('disconnect', () => {
    console.log('user disconnected')
  })

  socket.on('message', (msg) => {
    socket.broadcast.emit('message', msg)
  })
})

http.listen(port, () => {
  console.log(`server started in ${port} port`)
})
