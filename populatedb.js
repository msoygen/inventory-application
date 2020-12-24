#! /usr/bin/env node

console.log(
  "This script populates some test items and categories to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0-mbdj7.mongodb.net/local_library?retryWrites=true"
);

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require("async");
var Item = require("./models/item");
var Category = require("./models/category");

var mongoose = require("mongoose");
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

var items = [];
var categories = [];

function itemCreate(name, description, category, price, number_in_stock, cb) {
  var item = new Item({
    name: name,
    description: description,
    category: category,
    price: price,
    number_in_stock: number_in_stock,
  });

  item.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Author: " + item);
    items.push(item);
    cb(null, item);
  });
}

function categoryCreate(name, description, cb) {
  var category = new Category({ name: name, description: description });

  category.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Genre: " + category);
    categories.push(category);
    cb(null, category);
  });
}

function createItems(cb) {
  async.parallel(
    [
      (callback) => {
        itemCreate(
          "Awesome Laptop",
          "The most powerful one",
          categories[0],
          "999.00",
          "100",
          callback
        );
      },
      (callback) => {
        itemCreate(
          "Moderately Awesome Laptop",
          "The moderately powerful one",
          categories[0],
          "899.00",
          "88",
          callback
        );
      },
      (callback) => {
        itemCreate(
          "Good Laptop",
          "The powerful one",
          categories[0],
          "799.00",
          "70",
          callback
        );
      },
      (callback) => {
        itemCreate(
          "Average Laptop",
          "The laptop with average power.",
          categories[0],
          "699.00",
          "12",
          callback
        );
      },
      (callback) => {
        itemCreate(
          "Awesome Phone",
          "The most powerful one",
          categories[1],
          "999.00",
          "100",
          callback
        );
      },
      (callback) => {
        itemCreate(
          "Moderately Awesome Phone",
          "The moderately most powerful one",
          categories[1],
          "899.00",
          "88",
          callback
        );
      },
      (callback) => {
        itemCreate(
          "Good Phone",
          "The powerful one",
          categories[1],
          "799.00",
          "70",
          callback
        );
      },
      (callback) => {
        itemCreate(
          "Average Phone",
          "The phone with average power.",
          categories[1],
          "699.00",
          "12",
          callback
        );
      },
    ],
    // optional callback
    cb
  );
}

function createCategories(cb) {
  async.parallel(
    [
      (callback) => {
        categoryCreate("Laptops", "Best Laptops", callback);
      },
      (callback) => {
        categoryCreate("Phones", "Best Phones", callback);
      },
    ],
    // optional callback
    cb
  );
}

async.series(
  [createCategories, createItems],
  // Optional callback
  function (err, results) {
    if (err) {
      console.log("FINAL ERR: " + err);
    }else{
      console.log("DONE");
    }
    
    // All done, disconnect from database
    mongoose.connection.close();
  }
);
