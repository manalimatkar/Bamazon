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
    fillProductsArr();
	// start prompts
	start();
});

var fillProductsArr = function(){
	connection.query('select * from bamazondb.products', function(err, result) {
    if (err) throw err;
    // console.log(result);
    // store the result in array
		for(var i=0; i<result.length; i++){
			productArr.push(result[i]);		
		}
	});
}	


var displayProducts = function(){
// display products details in table using console.table package
	connection.query('select * from bamazondb.products',function(err,result){
		if(err) throw err;
		console.log("\n"+"----------------------------------------------------------------------------------------------");
		console.table(result);	
		console.log("\n"+"-----------------------------------------------------------------------------------------------");
		start();	
	});
}

var viewLowInventory = function(){
	// display products details in table using console.table package
	connection.query('select * from bamazondb.products where stockQuantity < 5',function(err,result){
		if(err) throw err;
		console.log("\n"+"----------------------------------------------------------------------------------------------");
		console.table(result);	
		console.log("\n"+"-----------------------------------------------------------------------------------------------");
		start();
	});
}

var updateInventory = function(){
	// console.log("inside updateInventory");

	// Prompt Item to update
	inquirer.prompt({
	 	name: "item",
        type: "rawlist",
        message: "Select Item To Add",
        choices: function() {
        		// create choice array from the products array created from the products table
                var choiceArray = [];
                for (var i = 0; i < productArr.length; i++) {
                	// console.log(productArr[i].itemId)
                    choiceArray.push(productArr[i].itemId + "." + productArr[i].productName + "." + productArr[i].stockQuantity);
                }
                return choiceArray;
            }
	 }).then(function(answer){

	 	// console.log("Item to Add::" + answer.item);

	 	// Spilt the item selected to get itemId and current stock
	 	var updateItemArr = answer.item.split(".");
	 	var updateItemId = updateItemArr[0];
	 	var currentStock = parseInt(updateItemArr[2]);

	 	// console.log("item Id to update:" + updateItemId);

	 	// prompt number of items to add
	 	inquirer.prompt({
	 		name: "quantity",
	 		type: "input",
	 		message: "Enter number of items to Add: " 		

	 	}).then(function(answer){

	 		var newStockQuantity = currentStock + parseInt(answer.quantity);

	 		// console.log("Current Stock of number of items" + newStockQuantity);

	 		// Update Inventory
	 		connection.query("UPDATE bamazondb.products set ? where ?", [{
			    stockQuantity: newStockQuantity
			}, {
			    itemId: updateItemId
			}], function(err, res) {
					if(err) throw err;
					console.log("\n"+ "Stock Updated!! " + "\n");
					// Empty products array
					productArr.splice(0, productArr.length);
					// Repopulate products array with new stock
					fillProductsArr();
					start();
			});

	 	});

	 });
}

var addProduct = function(){
	inquirer.prompt([{
		name: "pName",
        type: "input",
        message: "Enter Product Name : "
      },{
      	name: "pDept",
        type: "input",
        message: "Enter Department : "
      },{
      	name: "pPrice",
        type: "input",
        message: "Enter Product Price : ",
        validate: function(value) {
            if (isNaN(value) == false) {
                return true;
            } else {
                return false;
            }
        }
    },{
    	name: "pQuantity",
        type: "input",
        message: "Number of items to add : ",
        validate: function(value) {
            if (isNaN(value) == false) {
                return true;
            } else {
                return false;
            }
        }
	}]).then(function(answer){
		// add product query
		connection.query("insert into bamazondb.products set ?", {
            productName: answer.pName,
            departmentName: answer.pDept,
            price: answer.pPrice,
            stockQuantity: answer.pQuantity
        }, function(err, res) {
            console.log("Your product added successfully!");
            // Empty products array
			productArr.splice(0, productArr.length);
			// Repopulate products array with new stock
			fillProductsArr();
            start();
        });

	});
}

var start = function(){
	 inquirer.prompt({
	 	name: "task",
        type: "rawlist",
        message: "What would you like to Do?",
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
	 }).then(function(answer){

	 	// Call each function based on the choice made
	 	if (answer.task == "View Products for Sale") {
	 		displayProducts();	 		
	 	}else if (answer.task == "View Low Inventory") {
	 		viewLowInventory();
	 	}else if(answer.task == "Add to Inventory"){
	 		updateInventory();
	 	}else if (answer.task == "Add New Product") {
	 		addProduct();
	 	}

	 });
}
