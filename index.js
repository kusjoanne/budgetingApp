//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");

const app = express();
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

const port = process.env.PORT;
app.listen(port||3000, function(){
  console.log("Listening on port "+port);
});

const url = "mongodb+srv://admin-joanne:myMoon1204@cluster0-9ruej.mongodb.net/budgetAppDB?retryWrites=true&w=majority";
mongoose.connect(url,{ useNewUrlParser: true });

const itemSchema = new mongoose.Schema({
  name: String,
  amount: Number
});

const dateSchema = new mongoose.Schema({
  date: Date,
  items: [itemSchema]
});

const balanceSchema = new mongoose.Schema({
  balance: Number,
  updateDate: Date
});

const Item = mongoose.model("Item",itemSchema);
const ItemDate = mongoose.model("Date",dateSchema);
const Balance = mongoose.model("Balance", balanceSchema);

// console.log(Date());
// const balance = new Balance({balance:1234, updateDate:Date()});
// balance.save();
///////////////////GET ROUTES/////////////////////////

app.get("/", function(req,res){
  //query the items collection and lets just get all results
  ItemDate.find(function(err, allDates){
    Balance.findOne(function(err,latestBalance){
      if(allDates){
        res.render("main.ejs",{allDates:allDates,balanceAmount:latestBalance});
      }
      else{
        console.log("No Items to Display");
      }
      }).sort('-updateDate');
  }).sort('-date');
});

///////////////////POST ROUTES/////////////////////////

app.post("/",function(req,res){
  const itemName = req.body.itemName;
  const itemAmount = req.body.itemAmount;
  const itemDate = req.body.itemDate;
  console.log("Passed Item Date From Form " + itemDate);
  console.log(typeof itemDate);
  const item = new Item({
    name: itemName,
    amount: itemAmount
  });
  item.save();

  ItemDate.findOne({date:itemDate},function(err,itemsDate){
    //if we already have items for that date just add to that date
    if(itemsDate){
      console.log("FOUND");
      itemsDate.items.push(item);
      itemsDate.save();
    //if we don't create a new date with that item
    }else{
      console.log("DOESNT EXIST");
      const date = new ItemDate({
        date: itemDate,
        items: [item]
      });
      date.save();
    }
  });
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
