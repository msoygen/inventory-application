var async = require("async");
var validator = require("express-validator");
const { body, validationResult } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");

var Item = require("../models/item");
var Category = require("../models/category");

var mongoose = require("mongoose");

exports.item_list = function item_list(req, res, next) {
  Item.find()
    .populate("category")
    .exec((err, list_items) => {
      if (err) return next(err);
      res.render("item_list", {
        title: "Item List",
        item_list: list_items,
      });
    });
};

exports.item_create_get = function item_create_get(req, res, next) {
  Category.find({}).exec(function (err, categories) {
    if (err) {
      return next(err);
    }
    // Successful, so render.
    res.render("item_form", {
      title: "Create Item",
      category_list: categories,
    });
  });
};

exports.item_create_post = [
  // Validate fields.
  body("name", "Name must not be empty.").trim().isLength({ min: 1 }),
  body("description", "Description must not be empty.")
    .trim()
    .isLength({ min: 1 }),
  body("category", "Category must not be empty.").trim().isLength({ min: 1 }),
  body("price", "Price must not be empty")
    .trim()
    .isNumeric()
    .withMessage("Price can only be a numeric value"),
  body("number_in_stock", "Number in stock must not be empty")
    .trim()
    .isNumeric()
    .withMessage("Number in stock can only be a numeric value"),

  // Sanitize fields (using wildcard).
  sanitizeBody("*").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create an Item object with escaped and trimmed data.
    var item = new Item({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      number_in_stock: req.body.number_in_stock,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      Category.find({}).exec(function (err, categories) {
        if (err) {
          return next(err);
        }
        // Successful, so render.
        res.render("item_form", {
          title: "Create Item",
          category_list: categories,
          errors: errors.array(),
        });
      });
      return;
    } else {
      // Data from form is valid. Save book.
      item.save(function (err) {
        if (err) {
          return next(err);
        }
        //successful - redirect to new book record.
        res.redirect(item.url);
      });
    }
  },
];

exports.item_update_get = function item_update_get(req, res, next) {
  var id = mongoose.Types.ObjectId(req.params.id);

  async.parallel(
    {
      item: function (callback) {
        Item.findById(id).populate("category").exec(callback);
      },
      categories: function (callback) {
        Category.find(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.item == null) {
        // No results.
        var err = new Error("Item not found");
        err.status = 404;
        return next(err);
      }
      // Success.
      // Mark our selected category as checked.
      results.categories.forEach((category) => {
        if (category._id.toString() == results.item.category._id.toString()) {
          category.checked = true;
        }
      });
      res.render("item_form", {
        title: "Update Item",
        category_list: results.categories,
        item: results.item,
      });
    }
  );
};

exports.item_update_post = [
  // Validate fields.
  body("name", "Name must not be empty.").trim().isLength({ min: 1 }),
  body("description", "Description must not be empty.")
    .trim()
    .isLength({ min: 1 }),
  body("category", "Category must not be empty.").trim().isLength({ min: 1 }),
  body("price", "Price must not be empty")
    .trim()
    .isNumeric()
    .withMessage("Price can only be a numeric value"),
  body("number_in_stock", "Number in stock must not be empty")
    .trim()
    .isNumeric()
    .withMessage("Number in stock can only be a numeric value"),

  // Sanitize fields (using wildcard).
  sanitizeBody("*").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create an Item object with escaped and trimmed data.
    var item = new Item({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      number_in_stock: req.body.number_in_stock,
      _id: req.params.id, //This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      Category.find({}).exec(function (err, categories) {
        if (err) {
          return next(err);
        }
        // Successful, so render.
        res.render("item_form", {
          title: "Create Item",
          category_list: categories,
          errors: errors.array(),
        });
      });
      return;
    } else {
      // Data from form is valid. Save item.
      Item.findByIdAndUpdate(req.params.id, item, {}, (err, theItem) => {
        if (err) {
          return next(err);
        }
        //successful - redirect to new item record.
        res.redirect(item.url);
      });
    }
  },
];

exports.item_delete_get = function item_delete_get(req, res, next) {
  var id = mongoose.Types.ObjectId(req.params.id);
  Item.findById(id)
    .populate("category")
    .exec(function (err, item) {
      if (err) return next(err);
      if (item == null) {
        // no results
        var err = new Error("Item not found");
        err.status = 404;
        return next(err);
      }
      // successful, render
      res.render("item_delete", {
        title: "Item",
        item: item,
      });
    });
};

exports.item_delete_post = function item_delete_post(req, res, next) {
  Item.findByIdAndRemove(req.body.itemid, function deleteItem(err) {
    if (err) {
      return next(err);
    }
    // Success - go to book list
    res.redirect("/inventory/items");
  });
};

exports.item_detail = function item_detail(req, res, next) {
  var id = mongoose.Types.ObjectId(req.params.id);
  Item.findById(id)
    .populate("category")
    .exec(function (err, item) {
      if (err) return next(err);
      if (item == null) {
        // no results
        var err = new Error("Item not found");
        err.status = 404;
        return next(err);
      }
      // successful, render
      res.render("item_detail", {
        title: "Item: ",
        item: item,
      });
    });
};
