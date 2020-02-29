// document.querySelector(".add-remove-btn").addEventListener("click",function(){
//
// })

var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

today = mm + '/' + dd + '/' + yyyy;

//will eventually need to be populated differently
document.querySelector(".items-date").textContent = today;
