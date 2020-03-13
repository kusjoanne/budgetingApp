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

const Item = mongoose.model("Item",itemSchema);
const ItemDate = mongoose.model("Date",dateSchema);

app.listen(port||3000, function(){
  console.log("Listening on port "+port);
});


app.get("/", function(req,res){
  //query the items collection and lets just get all results
  ItemDate.find(function(err, allDates){
    if(allDates){
      console.log(allDates);
      res.render("main.ejs",{allDates:allDates});
    }
  })
  // res.sendFile(__dirname+"/index.html");
});

//Add Item
app.post("/",function(req,res){
  const itemName = req.body.itemName;
  const itemAmount = req.body.itemAmount;
  const itemDate = new Date(req.body.itemDate).toISOString();
  console.log("Passed Item Date From Form " + itemDate);
  console.log(typeof itemDate);
  const item = new Item({
    name: itemName,
    amount: itemAmount
  })
  item.save();

  ItemDate.findOne({date:itemDate},function(err,itemsDate){
    //if we already have items for that date just add to it
    console.log("Date in DB "+itemsDate.date);
    if(itemsDate){
      itemsDate.items.push(item);
    //if we don't create a new date
    }else{
      const date = new ItemDate({
        date: itemDate,
        items: [item]
      });
    }
  });
  res.redirect("/");
});
//
// app.post("/",function(req,res){
//   const itemName = req.body.itemName;
//   const itemAmount = req.body.itemAmount;
//   const itemDate = req.body.itemDate;
//   const itemFrequency = req.body.itemFrequency;
//   console.log(itemName+" "+itemAmount+" "+itemDate+" "+itemFrequency);
// });

// var today = new Date();
// var options = {weekday:'long', year:'numeric', month:'long', day:'numeric'};
// const todaysDate =today.toLocaleDateString("en-US",options);
// console.log(todaysDate);

// will eventually need to be populated differently
// document.querySelector(".items-date").textContent = today;
//
// $("#addItem").click(function(){
//   console.log("Test2");
//   $("tbody").after("<tr><td>Rent</td><td>-1250.00</td><td>$15,000.00</td><td><img src='https://image.flaticon.com/icons/svg/1159/1159633.svg' class='edit'></td></tr>");
// });
