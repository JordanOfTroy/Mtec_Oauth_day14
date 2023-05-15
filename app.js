require('dotenv').config()
const {CLIENT_ID, CLIENT_SECRET, SECRET, PORT, FB_APP_ID, FB_APP_SECRET} = process.env
// const { profile } = require('console')
const express = require('express')
const session = require('express-session')
const authRouter = express.Router()
const passport = require('passport')
const GoogleStrat = require('passport-google-oauth').OAuth2Strategy
const FacebookStrat = require('passport-facebook')

const app = express()


app.set('views', './views')
app.set('view engine', 'pug')

app.use(session({
    secret: SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 6000
    }
}))

app.use(passport.initialize())
app.use(passport.session())

passport.use(new GoogleStrat({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
    done(null, profile)
}))

passport.use(new FacebookStrat({
    clientID: FB_APP_ID,
    clientSecret: FB_APP_SECRET,
    callbackURL: 'http://localhost:3000/oauth2/redirect/facebook',
    state: true
}, function verify(accessToken, refreshToken, profile, cb) {
    return cb(null, profile)
}))

passport.serializeUser((user, done) => {
    done(null, user)
})
passport.deserializeUser(((user, done) => {
    done(null, user)
}))

app.use('/auth', authRouter)

authRouter.get('/google', passport.authenticate('google', {
    scope: ['email', 'profile']
}))

authRouter.get('/google/callback', passport.authenticate('google', {
    successRedirect: '/userDetails',
    failureRedirect: '/'
}))


app.get("/oauth2/redirect/facebook", passport.authenticate('facebook', {
    successRedirect: '/userDetails',
    failureRedirect: '/'
}))

app.get("/login/federated/facebook", passport.authenticate('facebook', {
    successRedirect: '/userDetails',
    failureRedirect: '/'
}))


app.get('/', (req, res) => {
    res.render('index')
})

app.get('/userDetails', (req, res) => {
    console.log(req.user)
    let {user} = req
    res.render('userDetails', {user})
})









app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`)
})