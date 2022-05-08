require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", 'ejs');

//Configure the session
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
}));

//Use passport initiliazi and session library
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

//Plug passportLocalMongoose to schema
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

//Setting up passportLocalMongoose to create a local log in strategy
passport.use(User.createStrategy());

//Set a passport to serialize and deserialize User
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res)=>{
  res.render('home');
});

app.get("/login", (req, res)=>{
  res.render('login');
});

app.get("/register", (req, res)=>{
  res.render('register');
});

app.get('/secrets', (req, res)=>{
  if(req.isAuthenticated()){
    res.render("secrets");
  } else{
    res.redirect("/login");
  }
});

app.get('/logout', (req, res)=>{
  req.logOut();
  res.redirect('/');
});

app.post('/register', (req, res)=>{
  User.register({username: req.body.username}, req.body.password, (err, user)=>{
    if(err){
      console.log(err);
      res.redirect('/register');
    } else{
      // Create a cookie from previous session
      passport.authenticate("local")(req, res, ()=>{
        res.redirect('/secrets');
      })
    }
  });
});

app.post("/login", (req, res)=>{
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  req.logIn(user, (err)=>{
    if(err){
      console.log(err);
    } else{
      passport.authenticate("local");
      res.redirect('/secrets');
    }
  })
});

const port = 3000;
app.listen(port, ()=>{console.log(`Listened to port ${port}`)});