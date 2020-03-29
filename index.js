//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + '/public'));
app.use(session({
  secret: process.env.PASSPORT_SECRET,
  resave: true,
  saveUninitialized: true
}));
//setsup passport
app.use(passport.initialize());
//tells passport to use session
app.use(passport.session());

const port = process.env.PORT;
const db_password = process.env.DB_PW;
const db_name = "budgetAppDB";
const saltRounds = 10;
const url = "mongodb+srv://admin-joanne:"+db_password+"@cluster0-9ruej.mongodb.net/"+db_name+"?retryWrites=true&w=majority";

mongoose.connect(url,{ useNewUrlParser: true });

const userSchema = new mongoose.Schema({
  username: String,
  password: String
});
//passportLocalMongoose is what is going to salt and hash our passwords and save to the DB
userSchema.plugin(passportLocalMongoose);

const itemSchema = new mongoose.Schema({
  username: String,
  name: String,
  amount: Number
});

const dateSchema = new mongoose.Schema({
  username: String,
  date: Date,
  items: [itemSchema]
});

const balanceSchema = new mongoose.Schema({
  username: String,
  balance: Number,
  updateDate: Date
});

const User = mongoose.model("User",userSchema);
const Item = mongoose.model("Item",itemSchema);
const ItemDate = mongoose.model("Date",dateSchema);
const Balance = mongoose.model("Balance", balanceSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.listen(port||3000, function(){
  console.log("Listening on port "+port);
});

///////////////////GET ROUTES/////////////////////////

app.get("/", function(req,res){
  //isAuthenticated() checks if the cookie exists in the request
  if(req.isAuthenticated()){
    ItemDate.find({username:req.user.username},function(err, allDates){
      //get the current balance for this user
      Balance.findOne({username:req.user.username},function(err,latestBalance){
        if(allDates){
          res.render("main.ejs",{allDates:allDates,balanceAmount:latestBalance});
        }
        else{
            res.render("main.ejs",{allDates:allDates,balanceAmount:latestBalance});
        }
        }).sort('-updateDate');
    }).sort('-date');
  } else{
    res.redirect("/login");
  }
});

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/register",function(req,res){
  res.render("register");
});

app.get("/initialsetup",function(req,res){
  //check if the user is authenticated
  if(req.isAuthenticated()){
    res.render("initialSetup");
  } else{
    res.redirect("/login");
  }
});

///////////////////POST ROUTES/////////////////////////

app.post("/",function(req,res){
  const itemName = req.body.itemName;
  const itemAmount = req.body.itemAmount;
  const itemDate = req.body.itemDate;
  const username = req.user.username;
  console.log(username);

  const item = new Item({
    username: username,
    name: itemName,
    amount: itemAmount
  });
  item.save();

  ItemDate.findOne({date:itemDate,username:username},function(err,itemsDate){
    if(err){
      console.log(err);
    }else{
      //if we already have items for that date just add to that date
      if(itemsDate){
        console.log("FOUND");
        itemsDate.items.push(item);
        itemsDate.save();
      //if we don't create a new date with that item
      }else{
        console.log("DOESNT EXIST");
        const date = new ItemDate({
          username: username,
          date: itemDate,
          items: [item]
        });
        date.save();
      }
    }
  });

  Balance.findOne(function(err,latestBalance){
    const newBalanceAmount = latestBalance.balance-itemAmount;
    const updatedBalance = new Balance({
      username: username,
      balance:newBalanceAmount,
      updateDate: Date()
    });
    updatedBalance.save();
  }).sort('-updateDate');

  res.redirect("/");
});


app.post("/reload",function(req,res){
  const days = req.body.dateFilter;
  console.log(days);
  ItemDate.find({date:{$gte: new Date(Date.now() - days*24*60*60 * 1000)}},function(err, allDates){
    if(allDates){
        //once you render the page here it doesn't actually redirect. it stays at that /reload post route.
      res.render("main.ejs",{allDates:allDates});
    }
  }).sort('-date');
});

app.post("/register",function(req,res){
  User.register({username: req.body.username}, req.body.password, function(err,user){
    if(err){
      console.log(err);
      res.redirect("/register");
    } else{
      //authentiation callback function is ONLY called if authentication was successful
      passport.authenticate('local')(req,res,function(err, user){
        res.redirect("/initialsetup");
      });
    }
  });
});

app.post("/initialsetup",function(req,res){
  const balance = req.body.inputBalance;
  const username = req.user.username;
  console.log(username);
  const newBalance = new Balance({
    username: username,
    balance: balance,
    updateDate: Date()
  });

  newBalance.save(function(err){
    if(err){
      console.log(err);
    }else{
      res.redirect("/");
    }
  });
});

app.post("/login",function(req,res){
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user,function(err){
    if(err){
      console.log(err);
    } else {
      passport.authenticate("local")(req,res,function(){
        res.redirect("/");
      });
    }
  });
});

app.post("/logout",function(req,res){
  req.logout();
  res.redirect("/login");
});
