var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ItemSchema = new Schema({
  name: { type: String, required: true, maxlength: 100 },
  description: { type: String, required: true, maxlength: 100 },
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  price: { type: Schema.Types.Number, required: true },
  number_in_stock: { type: Schema.Types.Number, required: true },
});

// Virtual for item's URL
ItemSchema.virtual("url").get(function () {
  return "/inventory/item/" + this._id;
});

//Export model
module.exports = mongoose.model("Item", ItemSchema);
