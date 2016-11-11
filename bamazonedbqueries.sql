create database Bamazondb;

use Bamazondb;

create table products(
itemId integer(10) not null auto_increment,
productName varchar(255) not null,
departmentName varchar(255),
price decimal(10,4) not null,
stockQuantity integer(10) not null,
primary key (itemId)
);

use Bamazondb;
create table departments(
departmentId integer(10),
departmentName varchar(255),
overHeadCosts decimal(10,4),
totalSales decimal(10,4)
);
insert into bamazondb.departments(departmentId, departmentName, overHeadCosts, totalSales)
values (004, 'toys' , 20.00 , 300);

insert into bamazondb.products(productName,departmentName,price,stockQuantity)
values ('Hamilton Beach WaveStation 4-Speed Blender','kitchen', 27.99,2);

