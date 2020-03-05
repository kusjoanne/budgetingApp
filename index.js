//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
const port = process.env.PORT;


app.use(express.static("public"));

app.listen(port||3000, function(){
  console.log("Listening on port "+port);
});

app.get("/", function(req,res){
  res.sendFile(__dirname+"/index.html");
});

//Add Item
app.post("/",function(req,res){
  const itemName = req.body.itemName;
  const itemAmount = req.body.itemAmount;
  const itemDate = req.body.itemDate;
  console.log(itemName+" "+itemAmount+" "+itemDate);
});
//
// app.post("/",function(req,res){
//   const itemName = req.body.itemName;
//   const itemAmount = req.body.itemAmount;
//   const itemDate = req.body.itemDate;
//   const itemFrequency = req.body.itemFrequency;
//   console.log(itemName+" "+itemAmount+" "+itemDate+" "+itemFrequency);
// });

var today = new Date();
var options = {weekday:'long', year:'numeric', month:'long', day:'numeric'};
const todaysDate =today.toLocaleDateString("en-US",options);
console.log(todaysDate);

// will eventually need to be populated differently
// document.querySelector(".items-date").textContent = today;
//
// $("#addItem").click(function(){
//   console.log("Test2");
//   $("tbody").after("<tr><td>Rent</td><td>-1250.00</td><td>$15,000.00</td><td><img src='https://image.flaticon.com/icons/svg/1159/1159633.svg' class='edit'></td></tr>");
// });
