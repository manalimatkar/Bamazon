// Include modules
var mysql = require('mysql');
var inquirer = require('inquirer');
require('console.table');

var productArr = [];

// Create sql connection
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root", //Your username
    password: "monalisa79", //Your password
    database: "bamazondb"
})

// connect to the database
connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
});



var productsDisplay = function(){
// display products details in table using console.table package
    connection.query('select * from bamazondb.products',function(err,result){
    	if(err) throw err;
    	console.log("\n"+"----------------------------------------------------------------------------------------------");
    	console.table(result);	
    	console.log("\n"+"-----------------------------------------------------------------------------------------------");

    	// store the result in array
    	for(var i=0; i<result.length; i++){
    		productArr.push(result[i]);		
    	}
    	// console.log("Products Array"+ JSON.stringify(productArr));

    	//Start Prompts
    	start();

    });
}
productsDisplay();
var start = function() {
	//Get the item id 
    inquirer.prompt({
        name: "item",
        type: "input",
        message: "Please enter the id of the product you would like to buy?"
    }).then(function(answer) {
    	//Get the item from product array and check the item's stockQuantity
    	var buyItem = productArr[answer.item - 1];
    	//  if item is in stock prompt user to input the quantity
    	 if (buyItem.stockQuantity > 0){
    	 	 	inquirer.prompt({
    	 		name: "quantity",
		        type: "input",
		        message: "Please enter the number of items you would like to purchase?"
    	 	}).then(function(answer){
    	 		console.log("Number of items to buy : " + answer.quantity); 
    	 		//See if the number of items enterted by user exist in stock
    	 		var enoughItems = buyItem.stockQuantity - answer.quantity; 
    	 		 if(enoughItems > 0){
    	 		 	// place order if the stock exixt
    	 		 	console.log("Order Accepted !!");
    				placeOrder(buyItem.itemId,answer.quantity);
    	 		 }else{
    	 		 	// Ask user if he wants to order existing number of items
    	 		 	console.log("We have only ::" + buyItem.stockQuantity + " items in stock");
    	 		 	inquirer.prompt({
    	 		 		name: "proceed",
				        type: "rawlist",
				        message: "Would you like to order the number of avaialble items?",
				        choices: ["YES", "NO"]
    	 		 	}).then(function(answer){
    	 		 		// if yes place order
    	 		 		if (answer.proceed == "YES") {
    	 		 			placeOrder(buyItem.itemId,buyItem.stockQuantity);
    	 		 		}else{
    	 		 			// else ask user to place a new order
    	 		 			console.log("Place a new order");
    	 		 			start();
    	 		 		}
    	 		 	});
    	 		 }

    	 	});
    	 }else{
    	 	// Tell user out of stock and place ask him to place a new order
    	 	console.log("This item is currently out of stock...would you like to buy another Item");
    	 	start();
      	 }        
    });
}

var placeOrder = function(orderItem, orderQuantity){
	// get purchase price of item selected and calculate total cost
	var purchasePrice = productArr[orderItem-1].price;
	var totalCost = purchasePrice * orderQuantity;
	
	// get new number of items in stock 
	var curStock = productArr[orderItem-1].stockQuantity - orderQuantity;
	// Update the database for the stock of item purchased
	connection.query("UPDATE bamazondb.products SET ? WHERE ?", [{
	    stockQuantity: curStock
	}, {
	    itemId: orderItem
	}], function(err, res) {
		if(err) throw err;
		console.log("Order Placed For:  " + productArr[orderItem-1].productName + " Number of Items::  " + orderQuantity);
		console.log("Total Amount To Pay For Order Placed :  " + totalCost);
        // productsDisplay();
        start();
	});

	

}

