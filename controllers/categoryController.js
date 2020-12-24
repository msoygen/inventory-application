var async = require("async");
var validator = require("express-validator");

var Item = require("../models/item");
var Category = require("../models/category");

var mongoose = require("mongoose");
const item = require("../models/item");

exports.category_index = function category_index(req, res, next) {
  Category.find().exec((err, list_categories) => {
    if (err) return next(err);
    res.render("index", {
      title: "Inventory Application",
      category_list: list_categories,
    });
  });
};

exports.category_list = function category_list(req, res, next) {
  Category.find().exec((err, list_categories) => {
    if (err) return next(err);
    res.render("category_list", {
      title: "Category List",
      category_list: list_categories,
    });
  });
};

exports.category_create_get = function category_create_get(req, res, next) {
  res.render("category_form", { title: "Create Category" });
};

exports.category_create_post = [
  // Validate fields.
  validator.body("name", "Name must not be empty.").trim().isLength({ min: 1 }),
  validator
    .body("description", "Description must not be empty.")
    .trim()
    .isLength({ min: 1 }),
  // Sanitize fields (using wildcard).
  validator.sanitizeBody("*").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validator.validationResult(req);

    // Create an Category object with escaped and trimmed data.
    var category = new Category({
      name: req.body.name,
      description: req.body.description,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      if (err) {
        return next(err);
      }
      // Successful, so render.
      res.render("category_form", {
        title: "Create Category",
        errors: errors.array(),
      });
    } else {
      // Data from form is valid. Save book.
      category.save(function (err) {
        if (err) {
          return next(err);
        }
        //successful - redirect to new book record.
        res.redirect(category.url);
      });
    }
  },
];

exports.category_update_get = function category_update_get(req, res, next) {
  var id = mongoose.Types.ObjectId(req.params.id);
  Category.findById(id).exec((err, category) => {
    if (err) return next(err);
    res.render("category_form", {
      title: "Update Category",
      category: category,
    });
  });
};

exports.category_update_post = [
  // Validate fields.
  validator.body("name", "Name must not be empty.").trim().isLength({ min: 1 }),
  validator
    .body("description", "Description must not be empty.")
    .trim()
    .isLength({ min: 1 }),

  // Sanitize fields (using wildcard).
  validator.sanitizeBody("*").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validator.validationResult(req);

    // Create an Category object with escaped and trimmed data.
    var category = new Category({
      name: req.body.name,
      description: req.body.description,
      _id: req.params.id, //This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      if (err) {
        return next(err);
      }
      // Successful, so render.
      res.render("category_form", {
        title: "Create Category",
        errors: errors.array(),
      });
    } else {
      // Data from form is valid. Save item.
      Category.findByIdAndUpdate(
        req.params.id,
        category,
        {},
        (err, theCategory) => {
          if (err) {
            return next(err);
          }
          //successful - redirect to new item record.
          res.redirect(category.url);
        }
      );
    }
  },
];

exports.category_delete_get = function category_delete_get(req, res, next) {
  var id = mongoose.Types.ObjectId(req.params.id);
  async.parallel(
    {
      category: (callback) => {
        Category.findById(id).exec(callback);
      },
      category_items: (callback) => {
        Item.find({ category: id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) return next(err);

      if (results.category == null) {
        // no results
        var err = new Error("Category not found.");
        err.status = 404;

        return next(err);
      }
      // successful, render
      res.render("category_delete", {
        title: "Category",
        category: results.category,
        category_items: results.category_items,
      });
    }
  );
};

exports.category_delete_post = function category_delete_post(req, res, next) {
  Category.findByIdAndRemove(req.body.categoryid, function deleteCategory(err) {
    if (err) {
      return next(err);
    }
    // Success - go to book list
    res.redirect("/inventory/categories");
  });
};

exports.category_detail = function category_detail(req, res, next) {
  var id = mongoose.Types.ObjectId(req.params.id);
  async.parallel(
    {
      category: (callback) => {
        Category.findById(id).exec(callback);
      },
      category_items: (callback) => {
        Item.find({ category: id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) return next(err);

      if (results.category == null) {
        // no results
        var err = new Error("Category not found.");
        err.status = 404;

        return next(err);
      }
      // successful, render
      res.render("category_detail", {
        title: "Category Detail",
        category: results.category,
        category_items: results.category_items,
      });
    }
  );
};
