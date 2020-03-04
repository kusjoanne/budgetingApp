var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

today = mm + '/' + dd + '/' + yyyy;

//will eventually need to be populated differently
document.querySelector(".items-date").textContent = today;

$("#addItem").click(function(){
  console.log("Test2");
  $("tbody").after("<tr><td>Rent</td><td>-1250.00</td><td>$15,000.00</td><td><img src='https://image.flaticon.com/icons/svg/1159/1159633.svg' class='edit'></td></tr>");
});
